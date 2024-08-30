import type { Rule, RuleReader } from "../types.js"
import type { TokenReader } from "../TokenReader.js"

export const unless =
  <T, CO, MO>(condition: Rule<T, CO>, onMatch: Rule<T, MO>) =>
  async (reader: TokenReader<T>) => {
    reader.savePosition()
    const match = await condition(reader)
    reader.restoreSave()

    return match === null ? onMatch(reader) : null
  }
