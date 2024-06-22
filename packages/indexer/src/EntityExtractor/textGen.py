from transformers import AutoTokenizer, AutoModelForCausalLM

# modelName = "stabilityai/stablelm-2-1_6b"
modelName = "unsloth/tinyllama"
tokenizer = AutoTokenizer.from_pretrained(modelName)
model = AutoModelForCausalLM.from_pretrained(modelName)


def getCategory(title):
    prompt = f"""El producto con el título "PANTALÓN TÉRMICO INTERIOR DE ESQUI Y NIEVE MUJER SWIX RACE" es un pantalón.\nEl producto con el título "CHÁNDAL CON SUDADERA CON CAPUCHA Y JOGGERS DE CORTE SLIM CON LAZO DE ASOS DESIGN" es un chándal.\nEl producto con el título "JEAN 501® LEVI'S® ORIGINAL" es un vaquero.\nEl producto con el título "BOTINES VAQUEROS" es un botín.\nEl producto con el título "BOSTON CELTICS SHOWTIME CITY EDITION PANTALÓN NIKE DRI-FIT DE LA NBA - HOMBRE" es un pantalón.\nEl producto con el título "{title}" es un"""
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(
        **inputs, max_new_tokens=10, stop_strings=".\n", tokenizer=tokenizer
    )
    output = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
    return output[(len(prompt) + 1) : -2]
