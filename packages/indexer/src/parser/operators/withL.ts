import { type Rule, RuleReader } from "./Rule.js"
import Context from "./Context.js"

const withL =
  <R extends Rule<never, unknown>>(checkFactory: (l: Context) => R) =>
  (reader: RuleReader<R>) => {
    const context = new Context()

    const result = checkFactory(context)(reader)

    return result === null ? null : { result, context }
  }

export default withL
