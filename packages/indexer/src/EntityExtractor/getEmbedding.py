from sentence_transformers import SentenceTransformer

embedderModel = SentenceTransformer("all-MiniLM-L6-v2")


def getEmbedding(title):
    return embedderModel.encode([title], convert_to_numpy=True)[0].tolist()
