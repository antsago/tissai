import type { Rule, RuleResult, RuleReader } from "../types.js"

type AndResults<T extends Rule<never, unknown>[]> = {
  [K in keyof T]: NonNullable<Awaited<RuleResult<T[K]>>>
}

const and =
  <I extends Rule<never, unknown>[]>(...checks: I) =>
  async (reader: RuleReader<I[number]>) => {
    const result = [] as AndResults<I>

    for (const check of checks) {
      const match = await check(reader)
      if (!match) {
        return null
      }

      result.push(match)
    }

    return result
  }

export default and
