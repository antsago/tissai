import type { WordToken } from "../types.js"
import {
  withL,
  and,
  any,
  or,
  Token,
  restructure,
  type Context,
} from "../operators/index.js"

export const Filler = Token((word: WordToken) => !word.isMeaningful)

export const Label = (context: Context) =>
  Token(
    (word: WordToken) =>
      word.isMeaningful && context.narrow(word.labels) !== null,
  )

export const Attribute = restructure(
  withL((l) => and(Label(l), any(and(any(Filler), Label(l))))),
  ({ result, context }) => {
    const text = (result.flat(Infinity) as WordToken[])
      .map((t: WordToken) => t.text)
      .join(" ")
    return { text, labels: context.labels }
  },
)

export const Attributes = any(or(Attribute, Filler))
