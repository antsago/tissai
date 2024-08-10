import parser from "./parser/index.js"
import mapping from "./mapping.js"
import { type Token, normalizer } from "./lexer/index.js";

const labeler = <T extends Token>(tokens: T[]) =>
  tokens.map((t) => ({
    ...t,
    labels: t.isMeaningful ? Object.keys(mapping[t.text]) : ["filler"],
  }))

const tokens = [
  { isMeaningful: true, text: "Pantalones" },
  { isMeaningful: true, text: "esquí" },
  { isMeaningful: false, text: "y" },
  { isMeaningful: true, text: "nieve" },
  { isMeaningful: false, text: "con" },
  { isMeaningful: true, text: "CREMALLERA" },
] as Token[]

const normalized = normalizer(tokens)
const labeled = labeler(normalized)
const attributes = parser(labeled)

console.dir(attributes, { depth: null })
