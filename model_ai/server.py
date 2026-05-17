import os
import sys
import io
import time
import logging
import csv
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

from dotenv import load_dotenv

# =========================================================================
# INIT ENVIRONMENT & LOGGING
# =========================================================================
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("ModelServer")

# =========================================================================
# PATH SETTINGS FOR SUB-MODULES
# =========================================================================
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

# Add parent dir so that model_ai.chatbot... absolute imports can be resolved
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Add current dir to sys.path
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Landmark Recognizer path
landmark_dir = os.path.join(current_dir, 'landmark_recognizer')
if landmark_dir not in sys.path:
    sys.path.insert(0, landmark_dir)

landmark_models_dir = os.path.join(landmark_dir, 'models')
if landmark_models_dir not in sys.path:
    sys.path.insert(0, landmark_models_dir)

# NOTE: chatbot_dir and recommend_dir are NOT added to sys.path because they contain folders
# like `src` or `utils` that would conflict with landmark_recognizer.
# - Chatbot's absolute imports are resolved via parent_dir as `model_ai.chatbot.src...`
# - Recommend's imports have been fully refactored to use relative imports, so it doesn't need to be in sys.path.
# - Landmark Recognizer's imports (like `import utils`) are resolved correctly from landmark_dir in sys.path.

# =========================================================================
# IMPORT MODULES
# =========================================================================
# Recommend
from recommend.src.recommender import recommend

# Landmark Recognizer
hash_locations_path = os.path.join(landmark_dir, 'hash_locations.csv')
location_lookup = {}
recognizer = None

def load_location_lookup():
    global location_lookup
    if os.path.exists(hash_locations_path):
        with open(hash_locations_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                location_lookup[str(row['id']).strip()] = row['location_name'].strip()
        logger.info("Đã load %d địa điểm từ hash_locations.csv", len(location_lookup))

# Chatbot
from model_ai.chatbot.src.vectorstore.vector_store import vector_store
from model_ai.chatbot.src.embeddings.embedding_model import EmbeddingModel
from model_ai.chatbot.src.llm.groq_client import GroqClient
from model_ai.chatbot.src.rag.rag_pipeline import RAGPipeline
from model_ai.chatbot.src.memory.chat_memory import ChatMemory
from model_ai.chatbot.src.api.chat_api import parse_ai_response_to_json, _validate_uuid
from model_ai.chatbot.src.config.config import SUPABASE_SESSIONS_TABLE

global_embedding_model = None
global_llm = None

# =========================================================================
# FASTAPI LIFESPAN
# =========================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    global recognizer, global_embedding_model, global_llm
    
    logger.info("=" * 60)
    logger.info("  KHỞI TẠO TỔNG HỢP MODEL AI SERVER")
    logger.info("=" * 60)
    
    # 1. Landmark Recognizer
    try:
        logger.info("⏳ Khởi tạo Landmark Recognizer...")
        load_location_lookup()
        from landmark_recognizer import LandmarkRecognizer
        recognizer = LandmarkRecognizer()
        recognizer.load_model(weights_dir=os.path.join(landmark_dir, 'weights'))
        recognizer.load_database(db_dir=os.path.join(landmark_dir, 'weights'))
    except Exception as e:
        logger.error(f"❌ Lỗi khởi tạo Landmark Recognizer: {e}")
    
    # 2. Chatbot RAG
    try:
        logger.info("⏳ Khởi tạo Chatbot RAG (VectorStore, Embedding, LLM)...")
        vector_store.load()
        global_embedding_model = EmbeddingModel()
        global_llm = GroqClient()
    except Exception as e:
        logger.error(f"❌ Lỗi khởi tạo Chatbot: {e}")
    
    logger.info("=" * 60)
    logger.info("  ✅ SERVER ĐÃ SẴN SÀNG!")
    logger.info("=" * 60)
    
    yield
    
    logger.info("Server đang tắt...")
    recognizer = None
    global_embedding_model = None
    global_llm = None


# =========================================================================
# FASTAPI APP DEFINITION & MIDDLEWARES
# =========================================================================

# Security Dependency
AI_KEY = os.getenv("AI_KEY")

def verify_internal_call(x_internal_secret: str = Header(None)):
    if x_internal_secret != AI_KEY:
        raise HTTPException(
            status_code=403, 
            detail="Cấm truy cập! Chỉ hệ thống trung gian mới được phép gọi AI."
        )

app = FastAPI(
    title="Tổng hợp AI Model Server",
    description="API server tích hợp Recommendation, Landmark Recognizer, và RAG Chatbot.",
    version="1.0.0",
    lifespan=lifespan,
    dependencies=[Depends(verify_internal_call)]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================================
# RECOMMEND ENDPOINTS
# =========================================================================
class RecommendDestination(BaseModel):
    province: str

class RecommendPreferences(BaseModel):
    categories: List[str]
    place_style: str = "must_go"

class RecommendStartingPoint(BaseModel):
    type: str = "address"
    name: str = "Trung tâm"

class RecommendLogistics(BaseModel):
    starting_point: RecommendStartingPoint
    transportation: str = "motorbike"

class RecommendRequest(BaseModel):
    destination: RecommendDestination
    preferences: RecommendPreferences
    logistics: RecommendLogistics

@app.post("/recommend/{user_id}", tags=["Recommend"])
async def get_recommendation(user_id: UUID, request: RecommendRequest):
    try:
        input_data = request.model_dump()
        result = recommend(input_data, user_id=str(user_id))
        
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message"))
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================================
# LANDMARK RECOGNIZER ENDPOINTS
# =========================================================================
class PredictResponse(BaseModel):
    success: bool
    label: Optional[str] = None
    location_name: Optional[str] = None
    inliers: int
    processing_time: float

class HealthResponse(BaseModel):
    status: str
    device: str
    faiss_ready: bool
    total_vectors: int
    total_labels: int

@app.get("/landmark/health", response_model=HealthResponse, tags=["Landmark Recognizer"])
async def landmark_health_check():
    if recognizer is None:
        raise HTTPException(status_code=503, detail="Hệ thống chưa sẵn sàng.")
    faiss_ready = hasattr(recognizer, 'index')
    return HealthResponse(
        status="healthy",
        device=str(recognizer.device),
        faiss_ready=faiss_ready,
        total_vectors=recognizer.index.ntotal if faiss_ready else 0,
        total_labels=len(set(recognizer.labels)) if hasattr(recognizer, 'labels') else 0,
    )

@app.get("/landmark/labels", tags=["Landmark Recognizer"])
async def get_labels():
    if recognizer is None or not hasattr(recognizer, 'labels'):
        raise HTTPException(status_code=503, detail="Database chưa được load.")
    unique_labels = sorted(set(recognizer.labels.tolist()))
    result = [{"id": lbl, "name": location_lookup.get(str(lbl), "")} for lbl in unique_labels]
    return {"total": len(result), "labels": result}

@app.post("/landmark/predict", response_model=PredictResponse, tags=["Landmark Recognizer"])
async def predict_landmark(file: UploadFile = File(...)):
    if recognizer is None or not hasattr(recognizer, 'index'):
        raise HTTPException(status_code=503, detail="Hệ thống chưa sẵn sàng.")
    
    allowed_extensions = {'.jpg', '.jpeg', '.png'}
    file_ext = Path(file.filename).suffix.lower() if file.filename else ''
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Định dạng không hợp lệ.")
    
    try:
        content = await file.read()
        image_stream = io.BytesIO(content)
        result = recognizer.predict(image_stream)
        
        if result[0] is None:
            return PredictResponse(success=False, label=None, location_name=None, inliers=result[1], processing_time=0)
        
        matched_img, inliers, elapsed = result
        label = str(recognizer.labels[recognizer.image_paths.tolist().index(matched_img)] if matched_img in recognizer.image_paths else "unknown")
        location_name = location_lookup.get(label, None)
        
        return PredictResponse(success=True, label=label, location_name=location_name, inliers=inliers, processing_time=round(elapsed, 3))
    except Exception as e:
        logger.error(f"Lỗi: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================================
# CHATBOT RAG ENDPOINTS
# =========================================================================
class NewChatRequest(BaseModel):
    user_id: UUID

class ChatRequest(BaseModel):
    message: str
    user_id: UUID
    session_id: Optional[str] = None

class RenameSessionRequest(BaseModel):
    title: str

@app.post("/chat/new", tags=["Chatbot"])
async def create_new_chat(req: NewChatRequest):
    try:
        memory = ChatMemory(user_id=str(req.user_id), session_id=None)
        return {"status": "success", "session_id": memory.session_id, "title": "New Chat"}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", tags=["Chatbot"])
async def chat_text(req: ChatRequest):
    if not req.message:
        raise HTTPException(status_code=400, detail="Tin nhắn không được để trống")
    try:
        rag = RAGPipeline(
            embedding_model=global_embedding_model,
            llm=global_llm,
            user_id=str(req.user_id),
            session_id=req.session_id
        )
        answer = rag.ask(req.message)
        return {"session_id": rag.memory.session_id, "reply": parse_ai_response_to_json(answer)}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Lỗi API /chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/{user_id}/{session_id}/history", tags=["Chatbot"])
async def get_chat_history(user_id: str, session_id: str):
    try:
        _validate_uuid(user_id)
        memory = ChatMemory(user_id=user_id, session_id=session_id)
        history = memory.get_all_history()
        return {"session_id": session_id, "total_messages": len(history), "messages": history}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/chat/{user_id}/{session_id}", tags=["Chatbot"])
async def delete_chat_session(user_id: str, session_id: str):
    try:
        _validate_uuid(user_id)
        memory = ChatMemory(user_id=user_id, session_id=session_id)
        memory.delete_session()
        return {"status": "success", "message": f"Đã xóa hội thoại {session_id}"}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{user_id}", tags=["Chatbot"])
async def get_user_sessions(user_id: str):
    try:
        _validate_uuid(user_id)
        sessions = ChatMemory.get_all_sessions(user_id=user_id)
        return {"user_id": user_id, "sessions": sessions}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/sessions/{user_id}/{session_id}/title", tags=["Chatbot"])
async def rename_session(user_id: str, session_id: str, req: RenameSessionRequest):
    try:
        _validate_uuid(user_id)
        from supabase import create_client
        supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        res = supabase.table(SUPABASE_SESSIONS_TABLE).update({"title": req.title}).eq("id", session_id).eq("user_id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Session không tồn tại")
        return {"status": "success", "session_id": session_id, "new_title": req.title}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================================
# RUNNER
# =========================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
