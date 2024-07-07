from functools import reduce
from transformers import AutoTokenizer, AutoModelForCausalLM
from getTags import getTags

modelName = "unsloth/tinyllama"
tokenizer = AutoTokenizer.from_pretrained(modelName)
model = AutoModelForCausalLM.from_pretrained(modelName)


def getPrompt(title, labels):
    labeled = "\n    ".join([f"""{token.text} <> {label}""" for (token, label) in labels])[:-1]
    return f"""Dados los nombres de los productos siguientes, etiqueta cada palabra con el nombre de los atributos que representa:
  Conjunto de cazadora y pantalón | Total look de hombre | SPF
    Conjunto <> categoría
    cazadora <> categoría
    pantalón <> categoría
    Total <> modelo
    look <> modelo
    hombre <> género,edad
    SPF <> marca

  Fred Perry Classic Swim Pantalones cortos
    Fred <> marca
    Perry <> marca
    Classic <> modelo
    Swim <> modelo
    Pantalones <> categoría
    cortos <> largo

  PANTALÓN PITILLO CON CREMALLERA BALONCESTO ADULTO
    PANTALÓN <> categoría
    PITILLO <> talle
    CREMALLERA <> cremallera
    BALONCESTO <> deporte
    ADULTO <> edad

  Pantalón térmico interior de esqui y nieve Mujer SWIX Race
    Pantalón <> categoría
    térmico <> térmico
    interior <> interior
    esqui <> deporte
    nieve <> deporte
    Mujer <> género
    SWIX <> marca
    Race <> modelo

  {title}
    {labeled}"""


def getLabel(title, labels, toLabel):
    prompt = getPrompt(title, [*labels, (toLabel, "")])

    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(
        **inputs, max_new_tokens=100, stop_strings=["\n ", "\n\n"], tokenizer=tokenizer
    )
    output = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]

    label = [
        w for w in output[(len(prompt) + 1) :].split("\n") if w and not w.isspace()
    ][-1]
    return [*labels, (toLabel, label)]


def getAttributes(title):
    words = getTags(title, verbatim=True)
    labels = reduce(lambda labels, toLabel: getLabel(title, labels, toLabel), words, [])
    return [{"label": label, "value": token.text, "offset": token.idx} for (token, label) in labels]
