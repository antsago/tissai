import { type Rule, type RuleResult, type RuleReader } from "./Rule.js"

type AndResults<T extends Rule<never, unknown>[]> = {
  [K in keyof T]: NonNullable<RuleResult<T[K]>>
}

const and =
  <I extends Rule<never, unknown>[]>(...checks: I) =>
  (reader: RuleReader<I[number]>) => {
    const result = [] as AndResults<I>

    for (const check of checks) {
      const match = check(reader)
      if (!match) {
        return null
      }

      result.push(match)
    }

    return result
  }

export default and
