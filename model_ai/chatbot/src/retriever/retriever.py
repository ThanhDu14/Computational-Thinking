class Retriever:
    def __init__(self, embedding_model, vectordb):
        self.embedding_model = embedding_model
        self.vectordb = vectordb

    def retrieve(self, query, top_k=5):
        query_vector = self.embedding_model.embed_query(query)
        docs = self.vectordb.search(query_vector, top_k)
        return docs