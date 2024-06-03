import sys
import json
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

for query in sys.stdin:
    title = json.loads(query)
    embedding = model.encode([title], convert_to_numpy=True)[0].tolist()
    print(json.dumps(embedding, separators=(",", ":")))
