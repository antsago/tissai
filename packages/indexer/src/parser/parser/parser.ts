import TokenReader, { type Token } from "./TokenReader.js"
import Filler from "./Filler.js"
import Attribute from "./Attribute.js"

const parser = (tokens: Token[]) => {
  const reader = new TokenReader(tokens)

  const statements = []

  while (reader.hasNext()) {
    const segment = Attribute(reader) ?? Filler(reader)

    if (segment) {
      statements.push(segment)
      continue
    }

    throw new Error("Should never happen")
  }

  return statements
}

export default parser
