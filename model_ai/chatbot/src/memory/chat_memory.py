import json
import os
from datetime import datetime
import uuid

class ChatMemory:
    """
    Manage chat history with session support and summarization for RAG chatbot
    """

    def __init__(self, base_path="data/chat_history"):
        self.base_path = base_path
        os.makedirs(self.base_path, exist_ok=True)
        self.sessions_file = os.path.join(self.base_path, "sessions.json")
        self.sessions = self._load_sessions()

    def _load_sessions(self):
        if not os.path.exists(self.sessions_file):
            return {}
        try:
            with open(self.sessions_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {}

    def _save_sessions(self):
        with open(self.sessions_file, "w", encoding="utf-8") as f:
            json.dump(self.sessions, f, ensure_ascii=False, indent=2)

    def get_user_sessions(self, user_id):
        user_sessions = []
        for sid, info in self.sessions.items():
            if info.get("user_id") == user_id:
                user_sessions.append({
                    "id": sid,
                    "title": info.get("title", "Cuộc hội thoại mới"),
                    "created_at": info.get("created_at")
                })
        # Sort by date desc
        return sorted(user_sessions, key=lambda x: x["created_at"], reverse=True)

    def create_session(self, user_id, title="Cuộc hội thoại mới"):
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "user_id": user_id,
            "title": title,
            "created_at": datetime.now().isoformat(),
            "summary": ""
        }
        self._save_sessions()
        
        # Create empty history file for this session
        session_file = os.path.join(self.base_path, f"{session_id}.json")
        with open(session_file, "w", encoding="utf-8") as f:
            json.dump([], f)
            
        return session_id

    def get_session_history(self, session_id):
        session_file = os.path.join(self.base_path, f"{session_id}.json")
        if not os.path.exists(session_file):
            return []
        try:
            with open(session_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return []

    def save_session_history(self, session_id, history):
        session_file = os.path.join(self.base_path, f"{session_id}.json")
        with open(session_file, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)

    def add_message(self, session_id, role, content):
        history = self.get_session_history(session_id)
        history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        self.save_session_history(session_id, history)
        return history

    def update_title(self, session_id, title):
        if session_id in self.sessions:
            self.sessions[session_id]["title"] = title
            self._save_sessions()

    def get_summary(self, session_id):
        return self.sessions.get(session_id, {}).get("summary", "")

    def update_summary(self, session_id, summary):
        if session_id in self.sessions:
            self.sessions[session_id]["summary"] = summary
            self._save_sessions()

    def delete_session(self, session_id):
        if session_id in self.sessions:
            del self.sessions[session_id]
            self._save_sessions()
            session_file = os.path.join(self.base_path, f"{session_id}.json")
            if os.path.exists(session_file):
                os.remove(session_file)
            return True
        return False