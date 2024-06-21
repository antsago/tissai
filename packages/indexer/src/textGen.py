from transformers import pipeline

prompt = '''El producto con el título "PANTALÓN TÉRMICO INTERIOR DE ESQUI Y NIEVE MUJER SWIX RACE" es un pantalón. El producto con el título "CHÁNDAL CON SUDADERA CON CAPUCHA Y JOGGERS DE CORTE SLIM CON LAZO DE ASOS DESIGN" es un chándal. El producto con el título "JEAN 501® LEVI'S® ORIGINAL" es un vaquero. El producto con el título "BOTINES VAQUEROS" es un botín. El producto con el título "BOSTON CELTICS SHOWTIME CITY EDITION PANTALÓN NIKE DRI-FIT DE LA NBA - HOMBRE" es un pantalón. El producto con el título "CONJUNTO DE JEANS, JERSEY,  CAZADORA Y BOTA | SPF" es un'''
generator = pipeline("text-generation", model="unsloth/tinyllama")
response = generator(prompt)
print(response)
