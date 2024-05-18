import sys
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')
# Control printing of embedding
np.set_printoptions(threshold=np.inf)
np.set_printoptions(linewidth=np.inf)
np.set_printoptions(suppress=True)

for query in sys.stdin:
  embedding = model.encode([query], convert_to_numpy=True)[0]
  print(embedding)
