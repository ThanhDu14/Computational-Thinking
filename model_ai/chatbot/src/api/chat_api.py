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
import re
import ast

from model_ai.chatbot.src.rag.rag_pipeline import RAGPipeline
from model_ai.chatbot.src.vectorstore.vector_store import vector_store
from model_ai.chatbot.src.embeddings.embedding_model import EmbeddingModel
from model_ai.chatbot.src.llm.groq_client import GroqClient
from model_ai.chatbot.src.memory.chat_memory import ChatMemory

from model_ai.chatbot.src.config.config import SUPABASE_SESSIONS_TABLE

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

def parse_ai_response_to_json(text: str):

    result = {
        "message": "",
        "data": []
    }

    current_location = None

    # normalize xuống dòng
    text = text.replace("\r\n", "\n")

    lines = text.split("\n")

    for raw_line in lines:

        line = raw_line.strip()

        if not line:
            continue

        # match key: value
        match = re.match(r"^([a-zA-Z_ ]+)\s*:\s*(.*)$", line)

        if not match:
            continue

        key = match.group(1).strip().lower()
        value = match.group(2).strip()

        # normalize key
        key = key.replace(" ", "_")

        # =====================================================
        # MESSAGE
        # =====================================================
        if key == "message":
            result["message"] = value
            continue

        # =====================================================
        # LOCATION START
        # =====================================================
        if key in ["location", "location_name"]:

            # push object cũ
            if current_location:
                result["data"].append(current_location)

            current_location = {
                "location": value
            }

            continue

        # =====================================================
        # FIELD CỦA LOCATION
        # =====================================================
        if current_location is not None:

            # category
            if key == "category":

                try:
                    parsed_category = ast.literal_eval(value)

                    if isinstance(parsed_category, list):
                        current_location[key] = parsed_category
                    else:
                        current_location[key] = [str(parsed_category)]

                except:
                    current_location[key] = [
                        x.strip()
                        for x in value.split(",")
                    ]

            # null
            elif value.upper() == "NULL":
                current_location[key] = None

            else:
                current_location[key] = value

    # append cuối
    if current_location:
        result["data"].append(current_location)

    return result
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
            "reply": parse_ai_response_to_json(answer)
        }
    except Exception as e:
        logger.error(f"Lỗi API /chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================================
# 3. LẤY LỊCH SỬ TIN NHẮN
# =====================================================================
@app.get("/chat/{user_id}/{session_id}/history")
async def get_chat_history(user_id: str, session_id: str):
    try:
        _validate_uuid(user_id)
        memory = ChatMemory(user_id=user_id, session_id=session_id)
        history = memory.get_all_history()
        return {
            "session_id": session_id,
            "total_messages": len(history),
            "messages": history
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Lỗi API /history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")


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