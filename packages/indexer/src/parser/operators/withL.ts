import { type Rule, type RuleReader, type RuleResult } from "./Rule.js"
import Context from "./Context.js"

const withL =
  <R extends Rule<never, unknown>>(checkFactory: (l: Context) => R) =>
  async (reader: RuleReader<R>) => {
    const context = new Context()

    const result = await checkFactory(context)(reader) as RuleResult<R>

    return result === null ? null : { result, context }
  }

export default withL
