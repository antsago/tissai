import _ from "lodash"
import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"
import type Context from "./Context.js"
import { withL, and, any, or, MatchToken } from "./operators.js"

export const Filler = MatchToken((nextToken) => !nextToken.isMeaningful)

export const Label = (context: Context) =>
  MatchToken(
    (nextToken) =>
      nextToken.isMeaningful && context.narrow(nextToken.labels) !== null,
  )

export const Attribute = (reader: TokenReader<Token>) => {
  const { result, context } = withL((l) =>
    and(Label(l), any(and(any(Filler), Label(l)))),
  )(reader)

  if (!result) {
    return null
  }

  const values = result.flat(Infinity)

  return {
    type: "attribute",
    labels: context.labels!,
    value: values,
  }
}

export const Product = any(or(Attribute, Filler))
