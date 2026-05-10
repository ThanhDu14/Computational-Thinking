# ============================================================
# embedding_model.py
# [THAY ĐỔI] model_name, batch_size, max_length lấy từ config
# ============================================================

from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np

# [THAY ĐỔI] Import từ config
from model_ai.chatbot.src.config.config import EMBEDDING_MODEL_NAME, EMBEDDING_BATCH_SIZE, EMBEDDING_MAX_LENGTH


class EmbeddingModel:
    def __init__(self, model_name: str = EMBEDDING_MODEL_NAME):
        # [THAY ĐỔI] model_name default lấy từ config
        self.device = torch.device("cpu")
        print("Using device:", self.device)

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)

        self.model.to(self.device)
        self.model.eval()

    def mean_pooling(self, model_output, attention_mask):
        token_embeddings = model_output.last_hidden_state
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        return torch.sum(token_embeddings * input_mask_expanded, dim=1) / \
               torch.clamp(input_mask_expanded.sum(dim=1), min=1e-9)

    def _encode(self, texts):
        if isinstance(texts, str):
            texts = [texts]

        inputs = self.tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=EMBEDDING_MAX_LENGTH,  # [THAY ĐỔI] từ config
            return_tensors="pt"
        )

        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)

        embeddings = self.mean_pooling(outputs, inputs["attention_mask"])
        embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)

        return embeddings.cpu().numpy()

    def embed_docs(self, docs, batch_size: int = EMBEDDING_BATCH_SIZE):
        # [THAY ĐỔI] batch_size default lấy từ config
        docs = [f"passage: {d}" for d in docs]

        all_embeddings = []

        for i in range(0, len(docs), batch_size):
            batch = docs[i:i + batch_size]
            emb = self._encode(batch)
            all_embeddings.append(emb)

        return np.vstack(all_embeddings)

    def embed_query(self, query):
        query = f"query: {query}"
        return self._encode(query)[0]