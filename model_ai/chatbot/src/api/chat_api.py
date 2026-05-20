# ============================================================
# chat_api.py
# ============================================================

from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
import os
import logging
import re
import ast
import io
import uuid
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), "../../../../.env")
load_dotenv(dotenv_path=env_path)

from model_ai.chatbot.src.rag.rag_pipeline import RAGPipeline
from model_ai.chatbot.src.vectorstore.vector_store import vector_store
from model_ai.chatbot.src.embeddings.embedding_model import EmbeddingModel
from model_ai.chatbot.src.llm.groq_client import GroqClient
from model_ai.chatbot.src.memory.chat_memory import ChatMemory

from model_ai.chatbot.src.config.config import SUPABASE_SESSIONS_TABLE

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

chat_router = APIRouter(tags=["Chatbot"])

global_embedding_model = None
global_llm = None


# =====================================================================
# STARTUP INIT FUNCTION (Called from server.py lifespan)
# =====================================================================
def init_chat_models():
    global global_embedding_model, global_llm
    try:
        logger.info("⏳ [STARTUP] Đang nạp Vector DB...")
        vector_store.load()

        logger.info("⏳ [STARTUP] Đang khởi tạo Embedding và LLM...")
        global_embedding_model = EmbeddingModel()
        global_llm = GroqClient()

        logger.info("✅ [STARTUP] Hệ thống AI Chatbot đã sẵn sàng!")
    except Exception as e:
        logger.error(f"❌ Lỗi khởi động Chatbot: {str(e)}")


# =====================================================================
# REQUEST MODELS
# =====================================================================
class ChatRequest(BaseModel):
    message: str
    user_id: UUID
    session_id: Optional[str] = None

class NewChatRequest(BaseModel):
    user_id: UUID

class RenameSessionRequest(BaseModel):
    title: str

# =====================================================================
# HELPER
# =====================================================================
def _validate_uuid(value: str):
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
    text = text.replace("\r\n", "\n")
    lines = text.split("\n")
    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue
        match = re.match(r"^([a-zA-Z_ ]+)\s*:\s*(.*)$", line)
        if not match:
            continue
        key = match.group(1).strip().lower().replace(" ", "_")
        value = match.group(2).strip()

        if key == "message":
            result["message"] = value
            continue

        if key in ["location", "location_name"]:
            if current_location:
                result["data"].append(current_location)
            current_location = {"location": value}
            continue

        if current_location is not None:
            if key == "category":
                try:
                    parsed_category = ast.literal_eval(value)
                    if isinstance(parsed_category, list):
                        current_location[key] = parsed_category
                    else:
                        current_location[key] = [str(parsed_category)]
                except:
                    current_location[key] = [x.strip() for x in value.split(",")]
            elif value.upper() == "NULL":
                current_location[key] = None
            else:
                current_location[key] = value

    if current_location:
        result["data"].append(current_location)

    return result

# =====================================================================
# 1. TẠO PHIÊN CHAT MỚI
# =====================================================================
@chat_router.post("/chat/new")
async def create_new_chat(req: NewChatRequest):
    try:
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
@chat_router.post("/chat")
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
@chat_router.get("/chat/{user_id}/{session_id}/history")
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
@chat_router.delete("/chat/{user_id}/{session_id}")
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
@chat_router.get("/sessions/{user_id}")
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
@chat_router.patch("/sessions/{user_id}/{session_id}/title")
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

# =====================================================================
# 7. CHAT VỚI ẢNH (LANDMARK RECOGNIZER + RAG)
# =====================================================================
@chat_router.post("/chat/image")
async def chat_with_image(
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    user_id: str = Form(...),
    session_id: Optional[str] = Form(None)
):
    try:
        _validate_uuid(user_id)
        
        if file is not None:
            file_bytes = await file.read()
            original_filename = file.filename
            content_type = file.content_type or "image/jpeg"
        elif image_url:
            import httpx
            from urllib.parse import urlparse
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(image_url, timeout=15.0)
                    if resp.status_code != 200:
                        raise HTTPException(status_code=400, detail=f"Không thể tải ảnh từ URL: HTTP {resp.status_code}")
                    file_bytes = resp.content
                    content_type = resp.headers.get("content-type", "image/jpeg")
                    
                    parsed_url = urlparse(image_url)
                    original_filename = os.path.basename(parsed_url.path) or "image.jpg"
                    # Loại bỏ phần query parameters nếu có trong filename
                    if "?" in original_filename:
                        original_filename = original_filename.split("?")[0]
            except HTTPException:
                raise
            except Exception as download_err:
                raise HTTPException(status_code=400, detail=f"Lỗi khi tải ảnh từ URL: {str(download_err)}")
        else:
            raise HTTPException(status_code=400, detail="Vui lòng cung cấp file ảnh qua tham số 'file' hoặc đường dẫn ảnh qua 'image_url'.")
            
        # 1. Upload ảnh lên Supabase Storage (bucket 'images')
        from supabase import create_client
        supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        
        # Tạo filename unique
        ext = os.path.splitext(original_filename)[1] or ".jpg"
        if len(ext) > 10 or not ext.startswith("."):  # Phòng chống các phần đuôi quá dài hoặc không hợp lệ
            ext = ".jpg"
        filename = f"{user_id}/{uuid.uuid4()}{ext}"
        
        res_upload = supabase.storage.from_("images").upload(
            file=file_bytes, 
            path=filename, 
            file_options={"content-type": content_type}
        )
        
        # Lấy URL public của ảnh
        image_url = supabase.storage.from_("images").get_public_url(filename)
        
        # 2. Gọi model Landmark Recognizer để dự đoán
        from landmark_recognizer.api.app import recognizer, location_lookup
        
        if recognizer is None:
            raise HTTPException(status_code=503, detail="Landmark Recognizer chưa được khởi tạo. Hãy chạy qua server.py hoặc port 8004.")
            
        result = recognizer.predict(io.BytesIO(file_bytes))
        
        if result is None or result[0] is None:
            location_name = "Không xác định"
        else:
            matched_img, inliers, elapsed = result
            label = str(recognizer.labels[recognizer.image_paths.tolist().index(matched_img)] 
                         if matched_img in recognizer.image_paths else "unknown")
            location_name = location_lookup.get(label, "Không xác định")

        # 3. Chèn vào bảng imageupload và imageidentifiedlocation
        upload_data = supabase.table("imageupload").insert({
            "user_id": user_id,
            "image_url": image_url,
            "status": "processed"
        }).execute()
        
        image_id = upload_data.data[0]["image_id"]
        
        if location_name != "Không xác định":
            supabase.table("imageidentifiedlocation").insert({
                "image_id": image_id,
                "detected_landmark_name": location_name,
                "confidence_score": float(inliers) if result else 0.0,
                "detected_by": "AI_DINOv2"
            }).execute()

        # 4. Gửi câu hỏi vào Chatbot (RAG)
        user_message_saved = f"![Image]({image_url})"

        if location_name != "Không xác định":
            prompt = f"![Image]({image_url})\n\nHãy cho tôi thêm thông tin về địa điểm {location_name} sau."
        else:
            prompt = f"![Image]({image_url})\n\n[Hệ thống: Không nhận diện được địa danh từ ảnh này]. Hãy phản hồi người dùng bằng câu xin lỗi rằng bạn không thể dự đoán được địa danh từ ảnh này và yêu cầu họ gửi lại ảnh khác rõ ràng hơn."
            
        rag = RAGPipeline(
            embedding_model=global_embedding_model,
            llm=global_llm,
            user_id=str(user_id),
            session_id=session_id
        )
        answer = rag.ask(query=prompt, user_message_override=user_message_saved)

        return {
            "session_id": rag.memory.session_id,
            "image_url": image_url,
            "location_name": location_name,
            "reply": parse_ai_response_to_json(answer)
        }

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Lỗi API /chat/image: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI(title="Chatbot API (Standalone)")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Khởi tạo model trước khi chạy
    @app.on_event("startup")
    async def startup_event():
        init_chat_models()
        
    app.include_router(chat_router)
    
    print("🚀 Chạy Chatbot API độc lập trên cổng 8002...")
    uvicorn.run(app, host="0.0.0.0", port=8002)