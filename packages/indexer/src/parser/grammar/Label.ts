import { type Context, MatchToken } from "../operators/index.js"

const Label = (context: Context) =>
  MatchToken(
    (nextToken) =>
      nextToken.isMeaningful && context.narrow(nextToken.labels) !== null,
  )

export default Label
