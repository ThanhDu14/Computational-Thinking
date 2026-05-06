from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import logging

from model_ai.chatbot.src.rag.rag_pipeline import RAGPipeline
from model_ai.chatbot.src.vectorstore.vector_store import vector_store
from model_ai.chatbot.src.embeddings.embedding_model import EmbeddingModel
from model_ai.chatbot.src.llm.groq_client import GroqClient
from model_ai.chatbot.src.memory.chat_memory import ChatMemory

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Nha Trang Travel Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Biến global để dùng chung giữa các request (tiết kiệm RAM)
global_embedding_model = None
global_llm = None

# =====================================================================
# KHỞI ĐỘNG KHI BẮT ĐẦU APP (STARTUP)
# =====================================================================
@app.on_event("startup")
async def startup_event():
    global global_embedding_model, global_llm
    try:
        logger.info("⏳ [STARTUP] Đang nạp cơ sở dữ liệu Vector...")
        vector_store.load()
        
        logger.info("⏳ [STARTUP] Đang khởi tạo Embedding và LLM...")
        global_embedding_model = EmbeddingModel()
        global_llm = GroqClient()
        
        logger.info("✅ [STARTUP] Hệ thống AI đã sẵn sàng!")
    except Exception as e:
        logger.error(f"❌ Lỗi khởi động: {str(e)}")

# =====================
# REQUEST MODELS
# =====================
class ChatRequest(BaseModel):
    message: str
    user_id: str = "guest"
    session_id: Optional[str] = None

class NewChatRequest(BaseModel):
    user_id: str = "guest"

# =====================================================================
# 1. API TẠO PHIÊN CHAT MỚI (NEW CHAT)
# =====================================================================
@app.post("/chat/new")
async def create_new_chat(req: NewChatRequest):
    try:
        # ChatMemory tự tạo session_id mới nếu truyền None
        memory = ChatMemory(user_id=req.user_id, session_id=None)
        return {
            "status": "success",
            "session_id": memory.session_id,
            "title": "Cuộc hội thoại mới"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================================
# 2. API CHAT (HỎI ĐÁP RAG)
# =====================================================================
@app.post("/chat")
async def chat_text(req: ChatRequest):
    if not req.message:
        raise HTTPException(status_code=400, detail="Tin nhắn không được để trống")
    
    try:
        rag = RAGPipeline(
            embedding_model=global_embedding_model,
            llm=global_llm,
            user_id=req.user_id,
            session_id=req.session_id
        )
        answer = rag.ask(req.message)
        return {
            "session_id": rag.memory.session_id,
            "reply": answer
        }
    except Exception as e:
        logger.error(f"Lỗi API /chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================================
# 3. API LẤY LỊCH SỬ TIN NHẮN (ĐỂ HIỂN THỊ)
# =====================================================================
@app.get("/chat/{user_id}/{session_id}/history")
async def get_chat_history(user_id: str, session_id: str):
    try:
        # Khởi tạo memory với session_id từ URL
        memory = ChatMemory(user_id=user_id, session_id=session_id)
        
        # Gọi đúng tên hàm đã sửa ở trên
        history = memory.get_all_history() 

        return {
            "session_id": session_id,
            "total_messages": len(history),
            "messages": history
        }
    except Exception as e:
        logger.error(f"Lỗi API /history: {str(e)}")
        # Trả về lỗi chi tiết để debug thay vì chỉ 500 chung chung
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")

# =====================================================================
# 4. API XÓA CUỘC HỘI THOẠI (DÀNH CHO NGƯỜI DÙNG)
# =====================================================================
@app.delete("/chat/{user_id}/{session_id}")
async def delete_chat_session(user_id: str, session_id: str):
    try:
        memory = ChatMemory(user_id=user_id, session_id=session_id)
        memory.delete_session()
        return {"status": "success", "message": f"Đã xóa hội thoại {session_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================================
# 5. API LẤY TẤT CẢ PHIÊN CHAT CỦA USER (SIDEBAR)
# =====================================================================
@app.get("/sessions/{user_id}")
async def get_user_sessions(user_id: str):
    try:
        sessions = ChatMemory.get_all_sessions(user_id=user_id)
        return {"user_id": user_id, "sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))