# ============================================================
# chat_memory.py
# [THAY ĐỔI] user_id: str nhưng giá trị phải là UUID string
#            → bỏ default "guest"
#            → thêm _validate_uuid() trước mọi thao tác DB
#            → Supabase nhận UUID string trực tiếp (không cần cast)
# ============================================================

from supabase import create_client
import os
from typing import List, Dict, Optional
from dotenv import load_dotenv
from uuid import UUID

load_dotenv()

from model_ai.chatbot.src.config.config import (
    SUPABASE_SESSIONS_TABLE,
    SUPABASE_MESSAGES_TABLE,
    MEMORY_MAX_RECENT,
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def _validate_uuid(value: str, field: str = "user_id"):
    """Ném ValueError nếu value không phải UUID hợp lệ."""
    try:
        UUID(value)
    except (ValueError, AttributeError):
        raise ValueError(f"{field} '{value}' không phải UUID hợp lệ")

REGISTRY_PATH = "data/chat_history/registry.json"

class ChatMemory:

    def __init__(
        self,
        session_id: Optional[str] = None,
        user_id: str = None,            # [THAY ĐỔI] không còn default "guest"
        max_recent: int = MEMORY_MAX_RECENT
    ):
        if not user_id:
            raise ValueError("user_id là bắt buộc và phải là UUID hợp lệ")

        # [THAY ĐỔI] Validate UUID trước khi làm bất cứ điều gì
        _validate_uuid(user_id)

        self.user_id = user_id
        self.max_recent = max_recent

        if session_id:
            self.session_id = session_id
            self.validate_session()
        else:
            self.session_id = self.create_session()

    # =====================================================
    # SUPABASE HELPER
    # =====================================================
    def _execute(self, query):
        res = query.execute()
        if res is None or not hasattr(res, "data"):
            raise Exception("Supabase query failed")
        return res

    # =====================================================
    # SESSION
    # =====================================================
    def validate_session(self):
        res = self._execute(
            supabase.table(SUPABASE_SESSIONS_TABLE)
            .select("user_id")
            .eq("id", self.session_id)
        )

        if not res.data:
            raise Exception(f"Session '{self.session_id}' không tồn tại")

        # [THAY ĐỔI] So sánh UUID string — Supabase trả về string dạng UUID
        if res.data[0]["user_id"] != self.user_id:
            raise Exception(
                f"Session '{self.session_id}' không thuộc user '{self.user_id}'"
            )

    def create_session(self) -> str:
        """
        [THAY ĐỔI] Truyền user_id dạng UUID string thẳng vào Supabase.
        Supabase tự cast string → uuid column.
        """
        print("Đang insert user_id:", self.user_id)
        res = self._execute(
            supabase.table(SUPABASE_SESSIONS_TABLE)
            .insert({
                "user_id": self.user_id,   # UUID string, Supabase tự cast
                "title": "New Chat",
                "summary": "",
            })
        )
        return res.data[0]["id"]

    # =====================================================
    # MESSAGE
    # =====================================================
    def add_chat(self, user_message: str, assistant_message: str, llm=None):
        data = [
            {"session_id": self.session_id, "role": "user",      "content": user_message},
            {"session_id": self.session_id, "role": "assistant",  "content": assistant_message},
        ]
        self._execute(supabase.table(SUPABASE_MESSAGES_TABLE).insert(data))

        if llm:
            # [TẮT] Không gọi update_summary và auto_title để tránh vượt giới hạn token Groq API
            # self.update_summary(llm)
            # self.auto_title(llm)
            pass

    def add_message(self, role: str, content: str):
        self._execute(
            supabase.table(SUPABASE_MESSAGES_TABLE).insert({
                "session_id": self.session_id,
                "role": role,
                "content": content
            })
        )

    # =====================================================
    # HISTORY
    # =====================================================
    def get_all_history(self) -> List[Dict]:
        res = self._execute(
            supabase.table(SUPABASE_MESSAGES_TABLE)
            .select("*")
            .eq("session_id", self.session_id)
            .order("created_at", desc=False)
        )
        return res.data or []

    def get_messages(self):
        return self.get_all_history()

    # =====================================================
    # SUMMARY
    # =====================================================
    def update_summary(self, llm):
        # messages = self.get_messages()
        # if len(messages) < self.max_recent:
        #     return

        # old_messages = messages[:-self.max_recent]
        # text = "\n".join([f"{m['role']}: {m['content']}" for m in old_messages])
        # prompt = f"Summarize the conversation briefly but keep important context:\n\n{text}\n\nSummary:"
        # summary = llm.generate(prompt).strip()
        # self._execute(
        #     supabase.table(SUPABASE_SESSIONS_TABLE)
        #     .update({"summary": summary})
        #     .eq("id", self.session_id)
        # )
        pass  # [THAY ĐỔI] Tạm thời không tự động update summary nữa, để tránh tốn token và chi phí

    # =====================================================
    # AUTO TITLE
    # =====================================================
    def auto_title(self, llm):
        # [TẮT] Toàn bộ logic auto title để tránh vượt giới hạn token Groq API
        # res = self._execute(
        #     supabase.table(SUPABASE_SESSIONS_TABLE)
        #     .select("title")
        #     .eq("id", self.session_id)
        #     .single()
        # )
        #
        # if res.data.get("title") != "New Chat":
        #     return
        #
        # messages = self.get_messages()
        # text = "\n".join([m["content"] for m in messages[:4]])
        # prompt = f"Generate a short title (max 8 words):\n\n{text}\n\nTitle:"
        # title = llm.generate(prompt).strip()
        #
        # self._execute(
        #     supabase.table(SUPABASE_SESSIONS_TABLE)
        #     .update({"title": title})
        #     .eq("id", self.session_id)
        # )
        pass

    # =====================================================
    # CONTEXT
    # =====================================================
    def get_context(self):
        messages = self.get_messages()

        # [TẮT] Không lấy summary để giảm token gửi lên Groq API
        # res = self._execute(
        #     supabase.table(SUPABASE_SESSIONS_TABLE)
        #     .select("summary")
        #     .eq("id", self.session_id)
        #     .single()
        # )
        # summary = res.data.get("summary", "")

        recent = messages[-self.max_recent:]
        recent_text = "\n".join([f"{m['role']}: {m['content']}" for m in recent])

        return {"summary": "", "recent": recent_text}

    # =====================================================
    # SESSION LIST
    # =====================================================
    @staticmethod
    def get_all_sessions(user_id: str):
        """
        [THAY ĐỔI] Validate UUID trước khi query.
        """
        _validate_uuid(user_id)   # [THAY ĐỔI] guard ở static method

        res = supabase.table(SUPABASE_SESSIONS_TABLE) \
            .select("id, title, created_at, summary") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

        return res.data or []

    # =====================================================
    # DELETE
    # =====================================================
    def delete_session(self):
        self.clear_messages()
        self._execute(
            supabase.table(SUPABASE_SESSIONS_TABLE)
            .delete()
            .eq("id", self.session_id)
        )

    def clear_messages(self):
        self._execute(
            supabase.table(SUPABASE_MESSAGES_TABLE)
            .delete()
            .eq("session_id", self.session_id)
        )
