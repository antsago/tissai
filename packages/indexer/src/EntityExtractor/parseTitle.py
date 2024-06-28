import sys
import json
from getCategory import getCategory
from getTags import getTags
from getEmbedding import getEmbedding

methods = {
    "embedding": getEmbedding,
    "category": getCategory,
    "tags": getTags,
}

for rawQuery in sys.stdin:
    query = json.loads(rawQuery)
    response = methods[query["method"]](query["input"])

    print(json.dumps({ query["method"]: response }, separators=(",", ":")))
