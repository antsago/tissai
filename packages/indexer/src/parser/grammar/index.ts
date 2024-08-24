import { withL, and, any, or, Token, type Context } from "../operators/index.js"
import type { WordToken } from "../types.js"

export const Filler = Token((word: WordToken) => !word.isMeaningful)
export const Label = (context: Context) =>
  Token(
    (word: WordToken) =>
      word.isMeaningful && context.narrow(word.labels) !== null,
  )
export const Attribute = withL((l) =>
  and(Label(l), any(and(any(Filler), Label(l)))),
)
export const Attributes = any(or(Attribute, Filler))
