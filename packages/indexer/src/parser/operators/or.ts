import type { Rule, RuleResult, RuleReader } from "../types.js"

const or =
  <I extends Rule<never, unknown>[]>(...checks: I) =>
  async (reader: RuleReader<I[number]>) => {
    for (const check of checks) {
      reader.savePosition()

      const match = await check(reader) as RuleResult<I[number]>
      if (match) {
        reader.discardSave()
        return match
      }

      reader.restoreSave()
    }

    return null
  }

export default or
