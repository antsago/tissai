import { Title } from "./grammar/index.js"
import TokenReader, { type Token as GrammarToken } from "./TokenReader.js"
import mapping from "./mapping.js"
import Lexer, { type Token } from "../lexer/index.js"

const parser = (tokens: GrammarToken[]) => {
  const reader = new TokenReader(tokens)

  return Title(reader)
}

const labeler = (tokens: Token[]) =>
  tokens.map((t) => ({
    ...t,
    labels: t.isMeaningful ? Object.keys(mapping[t.text]) : ["filler"],
  }))

const lexer = Lexer()

const title = "Pantalones esquí y nieve con CREMALLERA"

const tokens = await lexer.tokenize(title)
const labeled = labeler(tokens)
const attributes = parser(labeled)

await lexer.close()

console.dir(attributes, { depth: null })
