import sys
import json
from transformers import pipeline
from labelWords import labelWords
from getCategory import getCategory

modelName = "unsloth/tinyllama"
revision = "277240b3a621a06cfc02acf7b1f53bdbcb27843b"
generator = pipeline(model=modelName, revision=revision, task="text-generation")


for rawQuery in sys.stdin:
    query = json.loads(rawQuery)
    category = getCategory(generator, query["title"])
    properties = labelWords(generator, query["words"], query["title"])
    print(
        json.dumps(
            {"category": category, "properties": properties}, separators=(",", ":")
        )
    )
