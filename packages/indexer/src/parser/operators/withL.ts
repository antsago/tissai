import type { Rule, RuleReader, RuleResult } from "../types.js"
import Context from "./Context.js"

const withL =
  <R extends Rule<never, unknown>>(checkFactory: (l: Context) => R) =>
  async (reader: RuleReader<R>) => {
    const context = new Context()

    const result = await checkFactory(context)(reader) as RuleResult<R>

    return result === null ? null : { result, context }
  }

export default withL
