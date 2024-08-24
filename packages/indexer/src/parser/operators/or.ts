import { type Token, type TokenReader } from "../TokenReader.js"
import { type Rule, type RuleResult } from "./Rule.js"

const or =
  <T extends Rule<unknown>[]>(...checks: T) =>
  (reader: TokenReader<Token>) => {
    for (const check of checks) {
      reader.savePosition()

      const match = check(reader) as RuleResult<T[number]>
      if (match) {
        reader.discardSave()
        return match
      }

      reader.restoreSave()
    }

    return null
  }

export default or
