import TokenReader, { type Token } from "./TokenReader.js"
import { Attribute, Filler } from "./grammar.js"
import { any, or } from "./operators.js"

const parser = (tokens: Token[]) => {
  const reader = new TokenReader(tokens)

  const attributes = any(or(Attribute, Filler))(reader)
  return attributes
}

export default parser
