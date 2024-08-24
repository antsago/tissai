import type { RuleResult, Rule, RuleReader } from "../types.js"

const any =
  <R extends Rule<never, unknown>>(check: R) =>
  async (reader: RuleReader<R>) => {
    const results = []

    while (reader.hasNext()) {
      reader.savePosition()

      const result = await (check(reader) as RuleResult<R>)
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
