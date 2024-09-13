import type { Rule, RuleReader, RuleResult } from "../types.js"
import Context from "./Context.js"
import { AwaitedMatch, NonMatch } from "./nonMatch.js"

const withL =
  <R extends Rule<never, unknown>>(checkFactory: (l: Context) => R) =>
  async (reader: RuleReader<R>) => {
    const context = new Context()

    const result = await (checkFactory(context)(reader) as RuleResult<R>)

    return result === NonMatch
      ? NonMatch
      : { result: result as AwaitedMatch<RuleResult<R>>, context }
  }

export default withL
