import parser from "./parser/index.js"
import mapping from "./mapping.js"
import Lexer, { type Token } from "../lexer/index.js"

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
