import sys
import json
from getCategory import getCategory
from getTags import getTags
from labelWords import getAttributes

methods = {
    "category": getCategory,
    "tags": getTags,
    "attributes": getAttributes,
}

for rawQuery in sys.stdin:
    query = json.loads(rawQuery)
    response = methods[query["method"]](query["input"])

    print(json.dumps({query["method"]: response}, separators=(",", ":")))
