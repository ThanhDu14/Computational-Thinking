import json
import os


class ChatMemory:
    """
    Manage chat history for RAG chatbot
    """

    def __init__(self, history_path="data/chat_history/history.json"):
        self.history_path = history_path
        self.history = self._load_history()

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

    def add_user_message(self, message: str):
        """
        Add user message to history
        """
        self.history.append({
            "role": "user",
            "content": message
        })
        self._save_history()

    def add_assistant_message(self, message: str):
        """
        Add assistant message to history
        """
        self.history.append({
            "role": "assistant",
            "content": message
        })
        self._save_history()

    def get_history(self):
        """
        Return chat history
        """
        return self.history

    def clear(self):
        """
        Clear history
        """
        self.history = []
        self._save_history()