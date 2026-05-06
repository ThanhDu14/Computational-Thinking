import logging
from model_ai.chatbot.src.rag.rag_pipeline import RAGPipeline
from model_ai.chatbot.src.vectorstore.vector_store import vector_store
from model_ai.chatbot.src.embeddings.embedding_model import EmbeddingModel
from model_ai.chatbot.src.llm.groq_client import GroqClient

# Tắt log rác nếu cần, hoặc để INFO để theo dõi quá trình chạy
logging.basicConfig(level=logging.WARNING) 

def main():
    print("⏳ Đang tải hệ thống AI, vui lòng chờ...")

    # 🔥 1. Load vector DB (Tải từ HuggingFace + load FAISS)
    vector_store.load()

    # 🔥 2. Khởi tạo các Model nặng (1 lần duy nhất)
    print("⏳ Đang tải Embedding Model và LLM...")
    global_embedding_model = EmbeddingModel()
    global_llm = GroqClient()

    # 🔥 3. Khởi tạo RAG pipeline cho phiên test hiện tại
    # Truyền user_id là "cli_test_user" để dễ phân biệt trong Database
    rag = RAGPipeline(
        embedding_model=global_embedding_model,
        llm=global_llm,
        user_id="guest" 
    )

    print("\n✅ RAG Chatbot đã sẵn sàng!")
    print(f"🔑 Session ID hiện tại: {rag.memory.session_id}")
    print("💡 Gõ 'exit' hoặc 'quit' để thoát.\n")
    print("-" * 50)

    # 🔥 4. Vòng lặp hỏi đáp (REPL)
    while True:
        try:
            query = input("\n🧑 You: ").strip()

            if not query:
                continue

            if query.lower() in ["exit", "quit"]:
                print("\n👋 Tạm biệt!")
                break

            # Gọi RAG pipeline để trả lời
            answer = rag.ask(query)

            print(f"\n🤖 Bot: {answer}")
            
        except KeyboardInterrupt:
            # Xử lý khi bấm Ctrl+C
            print("\n👋 Tạm biệt!")
            break
        except Exception as e:
            print(f"\n❌ Lỗi: {str(e)}")

if __name__ == "__main__":
    main()