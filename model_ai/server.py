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

# NOTE: chatbot_dir and recommend_dir are NOT added to sys.path because they contain folders
# like `src` or `utils` that would conflict with landmark_recognizer.
# - Chatbot's absolute imports are resolved via parent_dir as `model_ai.chatbot.src...`
# - Recommend's imports have been fully refactored to use relative imports, so it doesn't need to be in sys.path.

# =========================================================================
# IMPORT SUB-MODULES
# =========================================================================
# Recommend
from recommend.api.recommend_api import recommend_router

# Landmark Recognizer
from landmark_recognizer.api.app import landmark_router, init_landmark_model

# Chatbot
from model_ai.chatbot.src.api.chat_api import chat_router, init_chat_models


# =========================================================================
# FASTAPI LIFESPAN
# =========================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info("  KHỞI TẠO TỔNG HỢP MODEL AI SERVER")
    logger.info("=" * 60)
    
    # 1. Landmark Recognizer
    init_landmark_model()
    
    # 2. Chatbot RAG
    init_chat_models()
    
    logger.info("=" * 60)
    logger.info("  ✅ SERVER ĐÃ SẴN SÀNG!")
    logger.info("=" * 60)
    
    yield
    
    logger.info("Server đang tắt...")


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
# MOUNT ROUTERS
# =========================================================================
app.include_router(recommend_router)
app.include_router(landmark_router)
app.include_router(chat_router)

# =========================================================================
# RUNNER
# =========================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8003, reload=False)
