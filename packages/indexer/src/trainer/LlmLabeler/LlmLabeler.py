import sys
import json
from transformers import pipeline
from labelWords import labelWords

modelName = "unsloth/tinyllama"
revision = "277240b3a621a06cfc02acf7b1f53bdbcb27843b"
generator = pipeline(model=modelName, revision=revision)


def getCategory(title):
    prompt = f"""El producto con el título "PANTALÓN TÉRMICO INTERIOR DE ESQUI Y NIEVE MUJER SWIX RACE" es un pantalón.
El producto con el título "CHÁNDAL CON SUDADERA CON CAPUCHA Y JOGGERS DE CORTE SLIM CON LAZO DE ASOS DESIGN" es un chándal.
El producto con el título "JEAN 501® LEVI'S® ORIGINAL" es un vaquero.\nEl producto con el título "BOTINES VAQUEROS" es un botín.
El producto con el título "BOSTON CELTICS SHOWTIME CITY EDITION PANTALÓN NIKE DRI-FIT DE LA NBA - HOMBRE" es un pantalón.
El producto con el título "{title}" es un"""
    output = generator(
        prompt,
        do_sample=False,
        max_new_tokens=5,
        return_full_text=False,
    )
    category = [
        w
        for w in output[0]["generated_text"].split("\n")[0].split(" ")
        if w and not w.isspace()
    ][0].replace(".", "")

    return category


for rawQuery in sys.stdin:
    query = json.loads(rawQuery)
    category = getCategory(query["title"])
    properties = labelWords(generator, query["words"], query["title"])
    print(
        json.dumps(
            {"category": category, "properties": properties}, separators=(",", ":")
        )
    )
