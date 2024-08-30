import type { Rule } from "../types.js"
import type { TokenReader } from "../TokenReader.js"
import { type AwaitedMatch, NonMatch } from "./nonMatch.js"

export const given =
  <T, RO, MO>(check: Rule<T, RO>, assertion: (ruleOutput: AwaitedMatch<RO>) => Boolean, onMatch: Rule<T, MO>) =>
  async (reader: TokenReader<T>) => {
    reader.savePosition()
    const match = await check(reader)
    reader.restoreSave()

    if (match === NonMatch || !assertion(match as AwaitedMatch<RO>)) {
      return NonMatch
    }

    return onMatch(reader)
  }
