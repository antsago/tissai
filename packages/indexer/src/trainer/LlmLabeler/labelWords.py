import string
from functools import reduce
from utils import getFirstWord


def getPrompt(title, labels):
    labeled = "\n    ".join(
        [f"""{token} <> {labels[0]}""" for (token, labels) in labels]
    )[:-1]
    return f"""Dados los nombres de los productos siguientes, etiqueta cada palabra con el nombre de los atributos que representa:
  Conjunto de cazadora y pantalón | Total look de hombre | SPF
    Conjunto <> categoría
    cazadora <> categoría
    pantalón <> categoría
    Total <> modelo
    look <> modelo
    hombre <> género
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


def getLabel(generator, title, previousLabels, toLabel):
    prompt = getPrompt(title, [*previousLabels, (toLabel, [""])])

    generated = generator(
        prompt,
        max_new_tokens=5,
        return_full_text=False,
        do_sample=False,
        num_beams=3,
        num_beam_groups=3,
        diversity_penalty=10.0,
        num_return_sequences=3,
    )

    labels = [getFirstWord(o["generated_text"]) for o in generated]

    return [*previousLabels, (toLabel, labels)]


def labelWords(generator, words, title):
    labels = reduce(
        lambda previousLabels, wordToLabel: getLabel(
            generator, title, previousLabels, wordToLabel
        ),
        words,
        [],
    )
    return [{"labels": labels, "value": token} for (token, labels) in labels]
