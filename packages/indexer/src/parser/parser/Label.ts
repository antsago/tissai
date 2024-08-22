import type Context from "./Context.js"
import { MatchToken } from "./Filler.js"

const Label = (context: Context) =>
  MatchToken(
    (nextToken) =>
      nextToken.isMeaningful && context.narrow(nextToken.labels) !== null,
  )

export default Label
