import sys
import json
from labelWords import getAttributes

methods = {
    "attributes": getAttributes,
}

for rawQuery in sys.stdin:
    query = json.loads(rawQuery)
    response = methods[query["method"]](query["input"])

    print(json.dumps({query["method"]: response}, separators=(",", ":")))
