import parseTokens from "./parserAnalyser.js"
import mapping from "./mapping.js"

type SpacyTokens = { isMeaningful: boolean; text: string }

const labeler = (tokens: SpacyTokens[]) =>
  tokens.map((t) => ({
    ...t,
    label: t.isMeaningful ? Object.keys(mapping[t.text])[0] : "filler",
  }))

const tokens = [
  { isMeaningful: true, text: "pantalones" },
  { isMeaningful: true, text: "esquí" },
  { isMeaningful: false, text: "y" },
  { isMeaningful: true, text: "nieve" },
  { isMeaningful: false, text: "con" },
  { isMeaningful: true, text: "CREMALLERA" },
]

const labeled = labeler(tokens)
const attributes = parseTokens(labeled)

console.dir(attributes, { depth: null })
