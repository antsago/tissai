import TokenReader, { type Token } from "./TokenReader.js"
import { Attribute, Filler } from "./Attribute.js"
import { any, or } from "./operators.js"

const parser = (tokens: Token[]) => {
  const reader = new TokenReader(tokens)

  const attributes = any(or(Attribute, Filler))(reader)
  return attributes
}

export default parser
