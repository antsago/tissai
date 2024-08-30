import type { Rule, RuleResult, RuleReader } from "../types.js"
import { NonMatch } from "./nonMatch.js"

const or =
  <I extends Rule<never, unknown>[]>(...checks: I) =>
  async (reader: RuleReader<I[number]>) => {
    for (const check of checks) {
      reader.savePosition()

      const match = await (check(reader) as RuleResult<I[number]>)
      if (match !== NonMatch) {
        reader.discardSave()
        return match
      }

      reader.restoreSave()
    }

    return NonMatch
  }

export default or
