import { withL, and, any, or, MatchToken, type Context } from "../operators/index.js"

export const Filler = MatchToken((nextToken) => !nextToken.isMeaningful)
export const Label = (context: Context) =>
  MatchToken(
    (nextToken) =>
      nextToken.isMeaningful && context.narrow(nextToken.labels) !== null,
  )
export const Attribute = withL((l) => and(Label(l), any(and(any(Filler), Label(l)))))
export const Title = any(or(Attribute, Filler))
