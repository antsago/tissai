import parser from "./parser/index.js"
import mapping from "./mapping.js"
import normalizer, { type SpacyTokens } from "./lexer.js";

const labeler = <T extends SpacyTokens>(tokens: T[]) =>
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
]

const normalized = normalizer(tokens)
const labeled = labeler(normalized)
const attributes = parser(labeled)

console.dir(attributes, { depth: null })
