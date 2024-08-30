import type { TokenReader } from "../TokenReader.js"
import type { Rule } from "../types.js"
import { type AwaitedMatch, NonMatch } from "./nonMatch.js"

export const restructure = <T, RO, O>(
    check: Rule<T, RO>,
    transform: (ruleOutput: AwaitedMatch<RO>) => O,
  ) =>
  async (reader: TokenReader<T>) => {
    const match = await check(reader)
    return match !== NonMatch ? await transform(match as AwaitedMatch<RO>) : NonMatch
  }
