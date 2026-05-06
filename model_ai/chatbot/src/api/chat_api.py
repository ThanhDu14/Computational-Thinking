from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from src.rag.rag_pipeline import RAGPipeline

# =====================
# Init app
# =====================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# Load RAG pipeline
# =====================
rag = RAGPipeline()


# =====================
# Request models
# =====================
class ChatRequest(BaseModel):
    message: str


class ImageResultRequest(BaseModel):
    location_name: str


# =====================
# TEXT API
# =====================
@app.post("/chat/text")
async def chat_text(req: ChatRequest):
    try:
        answer = rag.ask(req.message)

        return {
            "reply": answer
        }

    except Exception as e:
        return {"error": str(e)}


# =====================
# IMAGE RESULT API
# (frontend đã xử lý ảnh)
# =====================
@app.post("/chat/image-result")
async def chat_from_image(req: ImageResultRequest):
    try:
        # convert image result -> query
        query = f"Giới thiệu về {req.location_name}"

        answer = rag.ask(query)

        return {
            "detected_location": req.location_name,
            "reply": answer
        }

    except Exception as e:
        return {"error": str(e)}


# =====================
# INPUT API (optional)
# =====================
@app.post("/chat/input")
async def chat_input(
    message: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    if not message and not image:
        return {"error": "No input"}

    return {
        "type": "image" if image else "text",
        "message": message
    }