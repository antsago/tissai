import type TokenReader from "../TokenReader.js"
import { type Token } from "../TokenReader.js"
import { type Rule } from "./Rule.js"
import Context from "./Context.js"

const withL =
  <T>(checkFactory: (l: Context) => Rule<T>) =>
  (reader: TokenReader<Token>) => {
    const context = new Context()

    const result = checkFactory(context)(reader)

    return result === null ? null : { result, context }
  }

export default withL
