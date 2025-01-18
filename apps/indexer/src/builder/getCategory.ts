import { type LLM } from "../trainer/label/LLM/index.js"
import { getFirstWord } from "../trainer/label/getFirstWord.js"

export async function getCategory(title: string, llm: LLM) {
  const output = await llm.send({
    prompt: `El producto con el título "PANTALÓN TÉRMICO INTERIOR DE ESQUI Y NIEVE MUJER SWIX RACE" es un pantalón.
El producto con el título "CHÁNDAL CON SUDADERA CON CAPUCHA Y JOGGERS DE CORTE SLIM CON LAZO DE ASOS DESIGN" es un chándal.
El producto con el título "JEAN 501® LEVI'S® ORIGINAL" es un vaquero.
El producto con el título "BOTINES VAQUEROS" es un botín.
El producto con el título "BOSTON CELTICS SHOWTIME CITY EDITION PANTALÓN NIKE DRI-FIT DE LA NBA - HOMBRE" es un pantalón.
El producto con el título "${title}" es un`,
    options: {
      max_new_tokens: 5,
      return_full_text: false,
      do_sample: false,
      num_beams: 3,
      num_beam_groups: 3,
      diversity_penalty: 9.99,
      num_return_sequences: 1,
    },
  })

  return getFirstWord(output[0] ?? "") ?? ""
}
