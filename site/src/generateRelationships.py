import json
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')
dbFile = open('./data/books.json')

books = [*json.load(dbFile).values()]
descriptions = [book['description'] for book in books]
embeddings = model.encode(descriptions, convert_to_tensor=True)

def convert_to_book(hit):
    return {
        'isbn': books[hit['corpus_id']]['primary_isbn13'],
        'score': hit['score']
    }
def convert_hits(hits):
    return [convert_to_book(hit) for hit in hits][1:]

hits = util.semantic_search(embeddings, embeddings, top_k=10)
relationships = { books[idx]['primary_isbn13']: convert_hits(hit) for idx, hit in enumerate(hits)}

print(json.dumps(relationships))
