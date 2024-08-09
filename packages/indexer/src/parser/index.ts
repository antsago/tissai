import parseTokens from "./parserAnalyser.js"
import mapping from "./mapping.js"
import { normalizeString } from "../schemaExtractor/normalize.js";

type SpacyTokens = { isMeaningful: boolean; text: string }

const labeler = <T extends SpacyTokens>(tokens: T[]) =>
  tokens.map((t) => ({
    ...t,
    labels: t.isMeaningful ? Object.keys(mapping[t.text]) : ["filler"],
  }))
const normalizer = (tokens: SpacyTokens[]) => tokens.map(({ text, ...rest }) => ({
  text: normalizeString(text),
  originalText: text,
  ...rest,
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
const attributes = parseTokens(labeled)

console.dir(attributes, { depth: null })
