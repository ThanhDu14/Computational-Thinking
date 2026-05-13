from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import uvicorn

from src.rag.rag_pipeline import RAGPipeline

# =====================
# Init app
# =====================
app = FastAPI(title="Hachimi AI Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class NewChatRequest(BaseModel):
    user_id: str

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
        return {
            "detected_location": req.location_name,
            "reply": answer
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)