import type { RuleResult, Rule, RuleReader } from "../types.js"
import { AwaitedMatch, NonMatch } from "./nonMatch.js"

const any =
  <R extends Rule<never, unknown>>(check: R) =>
  async (reader: RuleReader<R>) => {
    const results = []

    while (reader.hasNext()) {
      reader.savePosition()

      const result = await (check(reader) as RuleResult<R>)
      if (result === NonMatch) {
        reader.restoreSave()
        break
      }

      results.push(result as AwaitedMatch<RuleResult<R>>)
      reader.discardSave()
    }

    return results
  }

export default any
