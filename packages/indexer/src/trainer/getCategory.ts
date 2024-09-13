import { type LLM } from "./LlmLabeler/index.js"
import { getFirstWord } from "./getFirstWord.js"

export const getCategory = async (llm: LLM, title: string) => {
  const output = await llm.send({
    prompt: `El producto con el título "PANTALÓN TÉRMICO INTERIOR DE ESQUI Y NIEVE MUJER SWIX RACE" es un pantalón.
El producto con el título "CHÁNDAL CON SUDADERA CON CAPUCHA Y JOGGERS DE CORTE SLIM CON LAZO DE ASOS DESIGN" es un chándal.
El producto con el título "JEAN 501® LEVI'S® ORIGINAL" es un vaquero.
El producto con el título "BOTINES VAQUEROS" es un botín.
El producto con el título "BOSTON CELTICS SHOWTIME CITY EDITION PANTALÓN NIKE DRI-FIT DE LA NBA - HOMBRE" es un pantalón.
El producto con el título "${title}" es un`,
    options: {
      do_sample: false,
      max_new_tokens: 5,
      return_full_text: false,
    },
  })

  return getFirstWord(output[0])
}
