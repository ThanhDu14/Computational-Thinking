from src.rag.rag_pipeline import RAGPipeline


def main():

    rag = RAGPipeline()

    print("RAG Chatbot ready. Type 'exit' to quit.\n")

    while True:

        query = input("You: ")

        if query.lower() in ["exit", "quit"]:
            break

        answer = rag.ask(query)

        print("\nBot:", answer)
        print()


if __name__ == "__main__":
    main()