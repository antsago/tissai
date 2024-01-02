import json
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')
dbFile = open('../data/products.json')

products = json.load(dbFile)
descriptions = [product['name'] for product in products]
embeddings = model.encode(descriptions, convert_to_numpy=True)

withEmbeddings = [{ 'embedding': embeddings[idx].tolist(), **product } for idx, product in enumerate(products)]
print(json.dumps(withEmbeddings, ensure_ascii=False))
