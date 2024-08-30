import type { Rule } from "../types.js"
import type { TokenReader } from "../TokenReader.js"

export const given =
  <T, RO, MO>(check: Rule<T, RO>, assertion: (ruleOutput: NonNullable<Awaited<RO>>) => Boolean, onMatch: Rule<T, MO>) =>
  async (reader: TokenReader<T>) => {
    reader.savePosition()
    const match = await check(reader)
    reader.restoreSave()

    if (!match || !assertion(match)) {
      return null
    }

    return onMatch(reader)
  }
