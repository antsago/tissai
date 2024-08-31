import type { Rule, RuleResult, RuleReader } from "../types.js"
import { NonMatch, type AwaitedMatch } from "./nonMatch.js"

type AndResults<T extends Rule<never, unknown>[]> = {
  [K in keyof T]: AwaitedMatch<RuleResult<T[K]>>
}

const and =
  <I extends Rule<never, unknown>[]>(...checks: I) =>
  async (reader: RuleReader<I[number]>) => {
    reader.savePosition()

    const result = [] as AndResults<I>

    for (const check of checks) {
      const match = await check(reader)
      if (match === NonMatch) {
        reader.restoreSave()
        return NonMatch
      }

      result.push(match)
    }

    reader.discardSave()
    return result
  }

export default and
