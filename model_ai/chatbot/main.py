import logging
from model_ai.chatbot.src.rag.rag_pipeline import RAGPipeline
from model_ai.chatbot.src.vectorstore.vector_store import vector_store
from model_ai.chatbot.src.embeddings.embedding_model import EmbeddingModel
from model_ai.chatbot.src.llm.groq_client import GroqClient

logging.basicConfig(level=logging.WARNING)

def main():
    print("⏳ Đang tải hệ thống AI, vui lòng chờ...")

    vector_store.load()

    print("⏳ Đang tải Embedding Model và LLM...")
    global_embedding_model = EmbeddingModel()
    global_llm = GroqClient()

    # [THAY ĐỔI] Dùng user_id thật từ cột user_id của public.users
    # Foreign key của chatsessions trỏ tới public.users.user_id (không phải .id)
    rag = RAGPipeline(
        embedding_model=global_embedding_model,
        llm=global_llm,
        user_id="c16ed0ed-216d-4160-96ba-71b1c531593d"
    )

    print("\n✅ RAG Chatbot đã sẵn sàng!")
    print(f"🔑 Session ID hiện tại: {rag.memory.session_id}")
    print("💡 Gõ 'exit' hoặc 'quit' để thoát.\n")
    print("-" * 50)

    while True:
        try:
            query = input("\n🧑 You: ").strip()

            if not query:
                continue

            if query.lower() in ["exit", "quit"]:
                print("\n👋 Tạm biệt!")
                break

            answer = rag.ask(query)
            print(f"\n🤖 Bot: {answer}")

        except KeyboardInterrupt:
            print("\n👋 Tạm biệt!")
            break
        except Exception as e:
            print(f"\n❌ Lỗi: {str(e)}")


if __name__ == "__main__":
    main()