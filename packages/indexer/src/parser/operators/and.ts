import { type Token, type TokenReader } from "../TokenReader.js"
import { type Rule, type RuleResult } from "./Rule.js"

type AndResult<T extends Rule<unknown>[]> = {
  [K in keyof T]: NonNullable<RuleResult<T[K]>>
}

const and =
  <T extends Rule<unknown>[]>(...checks: T) =>
  (reader: TokenReader<Token>) => {
    const result = [] as AndResult<T>

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
