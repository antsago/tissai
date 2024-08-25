import type { Rule, RuleResult, RuleReader } from "../types.js"

export const restructure =
  <R extends Rule<never, unknown>, O>(
    check: R,
    transform: (ruleOutput: NonNullable<Awaited<RuleResult<R>>>) => O,
  ) =>
  async (reader: RuleReader<R>) => {
    const match = await (check(reader) as RuleResult<R>)
    return match ? transform(match) : null
  }
