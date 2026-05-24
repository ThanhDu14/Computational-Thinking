import time
import logging
import threading

from model_ai.chatbot.src.retriever.retriever import Retriever
from model_ai.chatbot.src.retriever.reranker import Reranker
from model_ai.chatbot.src.prompt.prompt_template import PromptTemplate
from model_ai.chatbot.src.memory.chat_memory import ChatMemory
from model_ai.chatbot.src.vectorstore.vector_store import vector_store

logger = logging.getLogger(__name__)

# ============================================================
# [PERF] Singleton Reranker — load CrossEncoder 1 lần duy nhất
# Tránh tạo mới model 560M params mỗi request
# ============================================================
_global_reranker = None

def get_reranker():
    global _global_reranker
    if _global_reranker is None:
        logger.info("⏳ [PERF] Khởi tạo Reranker singleton...")
        _global_reranker = Reranker()
        logger.info("✅ [PERF] Reranker singleton đã sẵn sàng!")
    return _global_reranker


class RAGPipeline:
    def __init__(self, embedding_model, llm, user_id="guest", session_id=None):
        # [FIXED] Nhận embedding_model và llm từ ngoài vào để không tốn RAM khởi tạo lại
        self.embedding_model = embedding_model
        self.llm = llm
        
        self.vectordb = vector_store.get_db()
        self.retriever = Retriever(self.embedding_model, self.vectordb)
        # [PERF] Dùng singleton thay vì tạo mới mỗi request
        self.reranker = get_reranker()
        self.prompt_builder = PromptTemplate()

        self.memory = ChatMemory(
            session_id=session_id,
            user_id=user_id
        )

    def ask(self, query: str, user_message_override: str = None):
        t_start = time.time()

        # --- Step 1: Retrieve ---
        # [FIX] Trích xuất phần text sạch để tránh làm nhiễu embedding và reranker bởi image URL dài
        search_query = query
        if query.startswith("![Image]"):
            close_paren_idx = query.find(")")
            if close_paren_idx != -1:
                search_query = query[close_paren_idx + 1:].strip()

        t0 = time.time()
        docs = self.retriever.retrieve(search_query)
        t_retrieve = time.time() - t0

        # --- Step 2: Rerank ---
        t0 = time.time()
        docs = self.reranker.rerank(search_query, docs)
        t_rerank = time.time() - t0

        # [PERF] Loại bỏ get_context() — trước đây query Supabase
        # nhưng kết quả không dùng (history=None)

        # --- Step 3: Build Prompt ---
        t0 = time.time()
        prompt = self.prompt_builder.build_prompt(
            query=query,
            contexts=docs,
            history=None
        )
        t_prompt = time.time() - t0

        # --- Step 4: LLM Generate ---
        t0 = time.time()
        answer = self.llm.generate(prompt)
        t_llm = time.time() - t0

        # --- Step 5: Save to DB (fire-and-forget) ---
        # [PERF] Chạy background thread để không block response
        saved_user_msg = user_message_override if user_message_override is not None else query
        thread = threading.Thread(
            target=self._save_chat_background,
            args=(saved_user_msg, answer),
            daemon=True
        )
        thread.start()

        t_total = time.time() - t_start
        logger.info(
            f"⏱️ [PERF] retrieve={t_retrieve:.3f}s | rerank={t_rerank:.3f}s | "
            f"prompt={t_prompt:.3f}s | llm={t_llm:.3f}s | total={t_total:.3f}s"
        )

        return answer

    def _save_chat_background(self, user_message: str, assistant_message: str):
        """[PERF] Lưu chat vào DB trong background thread."""
        try:
            self.memory.add_chat(
                user_message=user_message,
                assistant_message=assistant_message,
                llm=self.llm
            )
        except Exception as e:
            logger.error(f"❌ [PERF] Lỗi lưu chat background: {e}")

    def auto_generate_title(self, session_id, history):
        """
        Generate a short title based on the first 2 messages
        """
        content = "\n".join([f"{m['role']}: {m['content']}" for m in history[:4]])
        prompt = f"Dựa vào nội dung hội thoại sau, hãy đặt một tiêu đề cực ngắn (dưới 5 từ) cho cuộc hội thoại này. Chỉ trả về tiêu đề, không thêm gì khác.\n\nNội dung:\n{content}"
        
        try:
            title = self.llm.generate(prompt).strip().replace('"', '')
            self.memory.update_title(session_id, title)
        except Exception as e:
            print(f"Failed to generate title: {e}")

    def auto_summarize(self, session_id, history):
        """
        Summarize the conversation so far
        """
        content = "\n".join([f"{m['role']}: {m['content']}" for m in history])
        old_summary = self.memory.get_summary(session_id)
        
        prompt = f"Hãy tóm tắt nội dung chính của cuộc hội thoại sau đây để lưu trữ bộ nhớ. "
        if old_summary:
            prompt += f"Đây là tóm tắt trước đó: {old_summary}. "
        prompt += f"\n\nNội dung mới:\n{content}\n\nTóm tắt mới (ngắn gọn, súc tích):"
        
        try:
            new_summary = self.llm.generate(prompt).strip()
            self.memory.update_summary(session_id, new_summary)
        except Exception as e:
            print(f"Failed to summarize: {e}")