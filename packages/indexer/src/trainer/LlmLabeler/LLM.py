import sys
import json
from transformers import pipeline

modelName = "unsloth/tinyllama"
revision = "277240b3a621a06cfc02acf7b1f53bdbcb27843b"
generator = pipeline(model=modelName, revision=revision, task="text-generation")


for rawQuery in sys.stdin:
    query = json.loads(rawQuery)
    prompt = query["prompt"]
    options = query["options"]
    
    output = generator(
        prompt,
        **options,
    )
    generated = [o["generated_text"] for o in output]

    print(json.dumps(generated, separators=(",", ":")))
