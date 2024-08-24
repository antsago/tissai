import { type RuleResult, type Rule, type RuleReader } from "./Rule.js"

const any =
  <R extends Rule<never, unknown>>(check: R) =>
  (reader: RuleReader<R>) => {
    const results = []

    while (reader.hasNext()) {
      reader.savePosition()

      const result = check(reader) as RuleResult<R>
      if (!result) {
        reader.restoreSave()
        break
      }

      results.push(result)
      reader.discardSave()
    }

    return results
  }

export default any
