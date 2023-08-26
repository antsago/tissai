from sentence_transformers import SentenceTransformer, util
from json import load

model = SentenceTransformer('all-MiniLM-L6-v2')
dbFile = open('./db.json')

books = [*load(dbFile).values()][0:5]
descriptions = [book['description'] for book in books]
embeddings = model.encode(descriptions, convert_to_tensor=True)

def convert_to_book(hit):
    return {
        'isbn': books[hit['corpus_id']]['primary_isbn13'],
        'score': hit['score']
    }
def convert_hits(hits):
    return [convert_to_book(hit) for hit in hits]

hits = util.semantic_search(embeddings, embeddings, top_k=3)
augmented = [convert_hits(hit) for hit in hits]

print(augmented)
