import type { WordToken } from "../../types.js"
import {
  withL,
  and,
  any,
  or,
  Token,
  restructure,
  type Context,
} from "../../operators/index.js"

export const Filler = Token((word: WordToken) => !word.isMeaningful || word.label === undefined)

export const Labeled = (context: Context) =>
  Token(
    (word: WordToken) =>
      word.isMeaningful && word.label !== undefined && context.narrow(word.label) !== null,
  )

export const Attribute = restructure(
  withL((l) => and(Labeled(l), any(and(any(Filler), Labeled(l))))),
  ({ result, context }) => {
    const value = (result.flat(Infinity) as WordToken[])
      .map((t: WordToken) => t.text)
      .join(" ")
    return { value, label: context.label }
  },
)

export const Attributes = any(or(Attribute, Filler))
