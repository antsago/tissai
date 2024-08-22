import _ from "lodash"
import type TokenReader from "../TokenReader.js"
import { type Token } from "../TokenReader.js"
import type Context from "./Context.js"
import { withL, and, any, or, MatchToken } from "./MatchToken.js"

export const Filler = MatchToken((nextToken) => !nextToken.isMeaningful)

export const Label = (context: Context) =>
  MatchToken(
    (nextToken) =>
      nextToken.isMeaningful && context.narrow(nextToken.labels) !== null,
  )

export const Attribute = (reader: TokenReader<Token>) => {
  const match = withL((l) => and(Label(l), any(and(any(Filler), Label(l)))))(
    reader,
  )

  return match === null
    ? null
    : {
        type: "attribute",
        labels: match.context.labels!,
        value: match.result.flat(Infinity),
      }
}

export const Product = any(or(Attribute, Filler))
