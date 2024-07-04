import sys
import json
from getCategory import getCategory
from getTags import getTags

methods = {
    "category": getCategory,
    "tags": getTags,
}

for rawQuery in sys.stdin:
    query = json.loads(rawQuery)
    response = methods[query["method"]](query["input"])

    print(json.dumps({query["method"]: response}, separators=(",", ":")))
