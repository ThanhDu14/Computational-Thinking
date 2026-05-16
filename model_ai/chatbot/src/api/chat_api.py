<<<<<<< HEAD
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import uvicorn
=======
# ============================================================
# chat_api.py
# [THAY ĐỔI] user_id đổi từ str → UUID (khớp Supabase Auth)
#            → Bỏ default "guest", require truyền UUID thật
#            → Validate UUID ở tầng Pydantic, trả 422 nếu sai
# ============================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from uuid import UUID   # [THAY ĐỔI] import UUID
import logging
>>>>>>> main

from model_ai.chatbot.src.rag.rag_pipeline import RAGPipeline
from model_ai.chatbot.src.vectorstore.vector_store import vector_store
from model_ai.chatbot.src.embeddings.embedding_model import EmbeddingModel
from model_ai.chatbot.src.llm.groq_client import GroqClient
from model_ai.chatbot.src.memory.chat_memory import ChatMemory

<<<<<<< HEAD
# =====================
# Init app
# =====================
app = FastAPI(title="Hachimi AI Chatbot API")
=======
from model_ai.chatbot.src.config.config import SUPABASE_SESSIONS_TABLE

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Nha Trang Travel Chatbot API")
>>>>>>> main

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# =====================
# Load RAG pipeline (Startup point 1)
# =====================
rag = RAGPipeline()

# =====================
# Request models
# =====================
class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: str
=======
global_embedding_model = None
global_llm = None


# =====================================================================
# STARTUP
# =====================================================================
@app.on_event("startup")
async def startup_event():
    global global_embedding_model, global_llm
    try:
        logger.info("⏳ [STARTUP] Đang nạp Vector DB...")
        vector_store.load()

        logger.info("⏳ [STARTUP] Đang khởi tạo Embedding và LLM...")
        global_embedding_model = EmbeddingModel()
        global_llm = GroqClient()

        logger.info("✅ [STARTUP] Hệ thống AI đã sẵn sàng!")
    except Exception as e:
        logger.error(f"❌ Lỗi khởi động: {str(e)}")


# =====================================================================
# REQUEST MODELS
# [THAY ĐỔI] user_id: str → UUID, bỏ default "guest"
# =====================================================================
class ChatRequest(BaseModel):
    message: str
    user_id: UUID           # [THAY ĐỔI] UUID bắt buộc, Pydantic tự validate format
    session_id: Optional[str] = None

class NewChatRequest(BaseModel):
    user_id: UUID           # [THAY ĐỔI] UUID bắt buộc

class RenameSessionRequest(BaseModel):
    title: str
>>>>>>> main

class NewChatRequest(BaseModel):
    user_id: str

<<<<<<< HEAD
class ImageResultRequest(BaseModel):
    location_name: str
    user_id: str
    session_id: str

# =====================
# API Endpoints
# =====================

@app.post("/chat/new")
async def create_new_chat(req: NewChatRequest):
    """Tạo một phiên chat mới cho người dùng"""
    try:
        session_id = rag.memory.create_session(req.user_id)
        return {
            "status": "success",
            "session_id": session_id,
            "title": "Cuộc hội thoại mới"
        }
    except Exception as e:
=======
# =====================================================================
# HELPER — validate UUID cho path params
# =====================================================================
def _validate_uuid(value: str):
    """
    [THAY ĐỔI] Path params vẫn là str nên cần validate thủ công.
    Ném ValueError → API trả 422 nếu không phải UUID hợp lệ.
    """
    try:
        UUID(value)
    except ValueError:
        raise ValueError(f"user_id '{value}' không phải UUID hợp lệ")


# =====================================================================
# 1. TẠO PHIÊN CHAT MỚI
# =====================================================================
@app.post("/chat/new")
async def create_new_chat(req: NewChatRequest):
    try:
        # [THAY ĐỔI] str(req.user_id) — Pydantic parse UUID object, cần convert lại str
        memory = ChatMemory(user_id=str(req.user_id), session_id=None)
        return {
            "status": "success",
            "session_id": memory.session_id,
            "title": "New Chat"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================================
# 2. CHAT (RAG)
# =====================================================================
@app.post("/chat")
async def chat_text(req: ChatRequest):
    if not req.message:
        raise HTTPException(status_code=400, detail="Tin nhắn không được để trống")

    try:
        # [THAY ĐỔI] str(req.user_id) convert UUID object → string
        rag = RAGPipeline(
            embedding_model=global_embedding_model,
            llm=global_llm,
            user_id=str(req.user_id),
            session_id=req.session_id
        )
        answer = rag.ask(req.message)

        return {
            "session_id": rag.memory.session_id,
            "reply": answer,
            "reply_markdown": answer,   # Frontend dùng trường này để render Markdown
        }
    except Exception as e:
        logger.error(f"Lỗi API /chat: {str(e)}")
>>>>>>> main
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_main(req: ChatRequest):
    """Endpoint chat chính (xử lý text, history, và auto-title/summary)"""
    try:
        answer = rag.ask(req.message, session_id=req.session_id)
        return {
            "reply": answer,
            "session_id": req.session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

<<<<<<< HEAD
@app.get("/chat/{session_id}/history")
async def get_history(session_id: str, user_id: str):
    """Lấy lịch sử tin nhắn của một phiên chat"""
    try:
        history = rag.memory.get_session_history(session_id)
        return {
            "session_id": session_id,
            "messages": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{user_id}")
async def list_sessions(user_id: str):
    """Lấy danh sách các phiên chat của người dùng (điểm 2: quản lý tiêu đề)"""
    try:
        sessions = rag.memory.get_user_sessions(user_id)
        return {
            "user_id": user_id,
            "sessions": sessions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/chat/{session_id}")
async def delete_session(session_id: str, user_id: str):
    """Xóa một phiên chat"""
    try:
        success = rag.memory.delete_session(session_id)
        if success:
            return {"status": "success", "message": f"Đã xóa hội thoại {session_id}"}
        else:
            raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Giữ lại các endpoint cũ để tương thích (optional)
@app.post("/chat/image-result")
async def chat_from_image(req: ImageResultRequest):
    try:
        query = f"Giới thiệu về {req.location_name}"
        answer = rag.ask(query, session_id=req.session_id)
=======
# =====================================================================
# 3. LẤY LỊCH SỬ TIN NHẮN
# =====================================================================
@app.get("/chat/{user_id}/{session_id}/history")
async def get_chat_history(user_id: str, session_id: str):
    try:
        _validate_uuid(user_id)
        memory = ChatMemory(user_id=user_id, session_id=session_id)
        history = memory.get_all_history()
>>>>>>> main
        return {
            "session_id": session_id,
            "total_messages": len(history),
            "messages": history
        }
<<<<<<< HEAD
=======
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
>>>>>>> main
    except Exception as e:
        logger.error(f"Lỗi API /history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")

<<<<<<< HEAD
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
=======

# =====================================================================
# 4. XÓA PHIÊN CHAT
# =====================================================================
@app.delete("/chat/{user_id}/{session_id}")
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


# =====================================================================
# 5. LẤY TẤT CẢ PHIÊN CHAT CỦA USER (SIDEBAR)
# =====================================================================
@app.get("/sessions/{user_id}")
async def get_user_sessions(user_id: str):
    try:
        _validate_uuid(user_id)
        sessions = ChatMemory.get_all_sessions(user_id=user_id)
        return {"user_id": user_id, "sessions": sessions}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================================
# 6. ĐỔI TÊN PHIÊN CHAT
# =====================================================================
@app.patch("/sessions/{user_id}/{session_id}/title")
async def rename_session(user_id: str, session_id: str, req: RenameSessionRequest):
    try:
        _validate_uuid(user_id)
        from supabase import create_client
        import os

        supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        res = supabase.table(SUPABASE_SESSIONS_TABLE) \
            .update({"title": req.title}) \
            .eq("id", session_id) \
            .eq("user_id", user_id) \
            .execute()

        if not res.data:
            raise HTTPException(status_code=404, detail="Session không tồn tại")

        return {"status": "success", "session_id": session_id, "new_title": req.title}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
>>>>>>> main
