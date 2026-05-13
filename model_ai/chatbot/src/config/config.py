# ============================================================
# config.py
# Đọc settings.yaml và export tất cả config thành biến Python
# Các file khác chỉ cần: from config import DATA_DIR, ...
# ============================================================

import os
import yaml

# ----------------------------------------------------------
# Load settings.yaml (tìm từ root project)
# ----------------------------------------------------------
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_SETTINGS_PATH = os.path.join(_BASE_DIR, "settings.yaml")

with open(_SETTINGS_PATH, "r", encoding="utf-8") as _f:
    _cfg = yaml.safe_load(_f)

# ============================================================
# 📂 PATHS
# ============================================================
DATA_DIR        = _cfg["paths"]["data_dir"]
CHUNKS_FILE     = _cfg["paths"]["chunks_file"]
VECTOR_DB_DIR   = _cfg["paths"]["vector_db_dir"]
FAISS_INDEX     = _cfg["paths"]["faiss_index"]
DOCS_JSON       = _cfg["paths"]["docs_json"]
REGISTRY_FILE   = _cfg["paths"]["registry_file"]   # [LEGACY] không còn dùng chính

# ============================================================
# 🤖 EMBEDDING
# ============================================================
EMBEDDING_MODEL_NAME = _cfg["embedding"]["model_name"]
EMBEDDING_BATCH_SIZE = _cfg["embedding"]["batch_size"]
EMBEDDING_MAX_LENGTH = _cfg["embedding"]["max_length"]

# ============================================================
# 💬 LLM (GROQ)
# ============================================================
LLM_MODEL_NAME  = _cfg["llm"]["model_name"]
LLM_TEMPERATURE = _cfg["llm"]["temperature"]
LLM_MAX_TOKENS  = _cfg["llm"]["max_tokens"]

# ============================================================
# 🗄️ VECTOR STORE (HuggingFace)
# ============================================================
HF_REPO_ID      = _cfg["vector_store"]["hf_repo_id"]
HF_FAISS_FILE   = _cfg["vector_store"]["hf_faiss_file"]
HF_DOCS_FILE    = _cfg["vector_store"]["hf_docs_file"]

# ============================================================
# 🧠 MEMORY
# ============================================================
MEMORY_MAX_RECENT   = _cfg["memory"]["max_recent"]

# ============================================================
# 🔷 SUPABASE TABLE NAMES
# ============================================================
SUPABASE_SESSIONS_TABLE = _cfg["supabase"]["sessions_table"]
SUPABASE_MESSAGES_TABLE = _cfg["supabase"]["messages_table"]