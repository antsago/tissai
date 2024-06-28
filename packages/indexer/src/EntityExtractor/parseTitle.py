import sys
import json
from getCategory import getCategory
from getTags import getTags
from getEmbedding import getEmbedding

for query in sys.stdin:
    title = json.loads(query)

    augmented = {
        "embedding": getEmbedding(title),
        "category": getCategory(title),
        "tags": getTags(title),
    }

    print(json.dumps(augmented, separators=(",", ":")))
