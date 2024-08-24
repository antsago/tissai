import { withL, and, any, or, Word, type Context } from "../operators/index.js"

export const Filler = Word((word) => !word.isMeaningful)
export const Label = (context: Context) =>
  Word((word) => word.isMeaningful && context.narrow(word.labels) !== null)
export const Attribute = withL((l) =>
  and(Label(l), any(and(any(Filler), Label(l)))),
)
export const Attributes = any(or(Attribute, Filler))
