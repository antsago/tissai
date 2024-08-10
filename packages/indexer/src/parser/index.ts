import parser from "./parser/index.js"
import mapping from "./mapping.js"
import { type Token, normalizer, Scanner } from "./lexer/index.js";

const labeler = <T extends Token>(tokens: T[]) =>
  tokens.map((t) => ({
    ...t,
    labels: t.isMeaningful ? Object.keys(mapping[t.text]) : ["filler"],
  }))

const scanner = Scanner()

const title = "Pantalones esquí y nieve con CREMALLERA"

const tokens = await scanner.tokenize(title)
const normalized = normalizer(tokens)
const labeled = labeler(normalized)
const attributes = parser(labeled)

await scanner.close()

console.dir(attributes, { depth: null })
