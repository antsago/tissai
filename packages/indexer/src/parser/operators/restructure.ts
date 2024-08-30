import type { TokenReader } from "../TokenReader.js"
import type { Rule } from "../types.js"

export const restructure = <T, RO, O>(
    check: Rule<T, RO>,
    transform: (ruleOutput: NonNullable<Awaited<RO>>) => O,
  ) =>
  async (reader: TokenReader<T>) => {
    const match = await check(reader)
    return match ? await transform(match) : null
  }
