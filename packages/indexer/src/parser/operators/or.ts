import { type Rule, type RuleResult, type RuleReader } from "./Rule.js"

const or =
  <I extends Rule<never, unknown>[]>(...checks: I) =>
  (reader: RuleReader<I[number]>) => {
    for (const check of checks) {
      reader.savePosition()

      const match = check(reader) as RuleResult<I[number]>
      if (match) {
        reader.discardSave()
        return match
      }

      reader.restoreSave()
    }

    return null
  }

export default or
