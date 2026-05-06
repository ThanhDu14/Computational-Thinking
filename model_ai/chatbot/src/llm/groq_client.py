import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


class GroqClient:
    """
    Client wrapper for Groq LLM API
    """

    def __init__(self, model: str = "llama-3.1-8b-instant"):
        """
        Initialize Groq client

        Args:
            model: model name
        """

        self.api_key = os.getenv("GROQ_API_KEY")

        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in .env")

        self.client = Groq(api_key=self.api_key)
        self.model = model

    def generate(self, prompt: str, temperature: float = 0.2, max_tokens: int = 512):
        """
        Generate response from LLM
        """

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )

        return response.choices[0].message.content