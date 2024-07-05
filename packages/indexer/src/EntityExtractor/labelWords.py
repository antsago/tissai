from transformers import AutoTokenizer, AutoModelForCausalLM

modelName = "unsloth/tinyllama"
tokenizer = AutoTokenizer.from_pretrained(modelName)
model = AutoModelForCausalLM.from_pretrained(modelName)


def labelWords(title):
    prompt = f"""Dados los nombres de los productos siguientes, etiqueta cada palabra con el nombre de los atributos que representa:
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

  Pantalón térmico interior lana merina de esquí y nieve Mujer Wedze BL 900
    Pantalón <> categoría
    térmico <>"""
    # térmico <> térmico
    # interior <> interior
    # lana <> tejido
    # merina <> tejido
    # esqui <> deporte
    # nieve <> deporte
    # Mujer <> género
    # Wedze <> marca
    # BL <> modelo
    # 900 <>"""


    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(
        **inputs, max_new_tokens=100, stop_strings="\n ", tokenizer=tokenizer
    )
    output = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]

    # return output[(len(prompt) + 1) : -2]
    return output


if __name__ == "__main__":
    output = labelWords("Pantalón térmico interior lana merina de esquí y nieve Mujer Wedze BL 900")
    print(output)
