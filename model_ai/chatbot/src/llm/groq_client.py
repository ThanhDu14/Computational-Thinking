# ============================================================
# groq_client.py
# [THAY ĐỔI] model, temperature, max_tokens lấy từ config
# ============================================================

import os
from groq import Groq
from dotenv import load_dotenv

# [THAY ĐỔI] Import từ config
from model_ai.chatbot.src.config.config import LLM_MODEL_NAME, LLM_TEMPERATURE, LLM_MAX_TOKENS

env_path = os.path.join(os.path.dirname(__file__), "../../../../.env")
load_dotenv(dotenv_path=env_path)


class GroqClient:
    def __init__(self, model: str = LLM_MODEL_NAME):
        # [THAY ĐỔI] default model lấy từ config
        self.api_key = os.getenv("GROQ_API_KEY")

        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in .env")

        self.client = Groq(api_key=self.api_key)
        self.model = model

    def generate(
        self,
        prompt: str,
        temperature: float = LLM_TEMPERATURE,   # [THAY ĐỔI] từ config
        max_tokens: int = LLM_MAX_TOKENS         # [THAY ĐỔI] từ config
    ):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )

        return response.choices[0].message.content