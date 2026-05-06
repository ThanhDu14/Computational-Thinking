import json
import os
import uuid
import datetime

REGISTRY_PATH = "data/chat_history/registry.json"

class ChatMemory:
    """
    Manage chat history for RAG chatbot
    """

    def __init__(self, history_path=None, session_id=None, user_id=None, **kwargs):
        self.user_id = user_id
        
        # Nếu có session_id, kiểm tra xem nó có hợp lệ không
        if session_id:
            if not self._is_valid_session(session_id, user_id):
                raise ValueError(f"Session '{session_id}' không tồn tại hoặc không thuộc về user '{user_id}'")
            self.session_id = session_id
        else:
            # Nếu chưa có session_id (tạo mới), sinh ra một UUID ngẫu nhiên
            self.session_id = str(uuid.uuid4())
            self._register_session(self.session_id, user_id)
        
        # Lưu file theo session_id
        self.history_path = f"data/chat_history/{self.session_id}.json"
        
        self.history = self._load_history()

    @classmethod
    def _load_registry(cls):
        if not os.path.exists(REGISTRY_PATH):
            return {}
        try:
            with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {}

    @classmethod
    def _save_registry(cls, registry):
        os.makedirs(os.path.dirname(REGISTRY_PATH), exist_ok=True)
        with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
            json.dump(registry, f, ensure_ascii=False, indent=2)

    def _is_valid_session(self, session_id, user_id):
        registry = self._load_registry()
        # Nếu user_id được truyền vào, bắt buộc session phải thuộc về user_id đó
        if user_id:
            user_sessions = registry.get(user_id, [])
            for session in user_sessions:
                if session.get("id") == session_id:
                    return True
            return False
        # Nếu không truyền user_id (API get/delete), chỉ cần kiểm tra xem session_id có trong hệ thống không
        else:
            for uid, sessions in registry.items():
                for session in sessions:
                    if session.get("id") == session_id:
                        return True
            return False

    def _register_session(self, session_id, user_id):
        if not user_id:
            user_id = "guest" # mặc định
        registry = self._load_registry()
        if user_id not in registry:
            registry[user_id] = []
        
        # Tạo thông tin session mới
        session_info = {
            "id": session_id,
            "title": "Cuộc hội thoại mới",
            "created_at": datetime.datetime.now().isoformat()
        }
        registry[user_id].append(session_info)
        self._save_registry(registry)

    @staticmethod
    def get_all_sessions(user_id: str):
        registry = ChatMemory._load_registry()
        return registry.get(user_id, [])

    def delete_session(self):
        # 1. Xóa file json history
        if os.path.exists(self.history_path):
            os.remove(self.history_path)
            
        # 2. Xóa khỏi registry
        registry = self._load_registry()
        for uid, sessions in registry.items():
            registry[uid] = [s for s in sessions if s.get("id") != self.session_id]
        self._save_registry(registry)

    def _load_history(self):
        """
        Load chat history from file
        """
        if not os.path.exists(self.history_path):
            return []

        try:
            with open(self.history_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return []

    def _save_history(self):
        """
        Save history to file
        """
        os.makedirs(os.path.dirname(self.history_path), exist_ok=True)

        with open(self.history_path, "w", encoding="utf-8") as f:
            json.dump(self.history, f, ensure_ascii=False, indent=2)

    def add_chat(self, user_message: str, assistant_message: str, llm=None):
        """
        Add both user and assistant messages to history
        """
        self.history.append({
            "role": "user",
            "content": user_message
        })
        self.history.append({
            "role": "assistant",
            "content": assistant_message
        })
        self._save_history()

    def get_context(self):
        """
        Return history formatted as a dict for PromptTemplate
        """
        history_lines = []
        recent_history = self.history[-4:] if len(self.history) >= 4 else self.history
        for h in recent_history:
            role = h.get("role", "user")
            content = h.get("content", "")
            history_lines.append(f"{role.capitalize()}: {content}")
            
        return {
            "summary": "",
            "recent": "\n".join(history_lines)
        }

    def get_all_history(self):
        """
        Return all history for API endpoints
        """
        return self.history

    def get_history(self, limit: int = 4):
        """
        Return chat history, limited to the last `limit` messages to prevent exceeding token limits.
        Each question-answer pair consists of 2 messages, so limit=4 means the last 2 questions.
        """
        return self.history[-limit:] if limit > 0 else self.history

    def clear(self):
        """
        Clear history
        """
        self.history = []
        self._save_history()
