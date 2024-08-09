import TokenReader, { type Token } from "./tokenReader.js"
import parseGrammar from "./grammar.js"

const parseTokens = (tokens: Token[]) => {
  const reader = new TokenReader(tokens)

  const statements = []

  while (reader.hasNext()) {
    const statement = parseGrammar(reader)

    if (statement) {
      statements.push(statement)
      continue
    }

    throw new Error("Syntax Error")
  }

  return statements
}

export default parseTokens
