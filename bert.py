from sentence_transformers import SentenceTransformer
from json import load

dbFile = open('./db.json')
books = load(dbFile) 

model = SentenceTransformer('all-MiniLM-L6-v2')

embedding = model.encode(books['9781649374042']['description'])
print(embedding)
