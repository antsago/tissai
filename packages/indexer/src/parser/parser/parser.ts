import TokenReader, { type Token } from "./TokenReader.js"
import { Product } from "./grammar.js"

const parser = (tokens: Token[]) => {
  const reader = new TokenReader(tokens)

  return Product(reader)
}

export default parser
