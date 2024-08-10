import { normalizeString } from "../schemaExtractor/normalize.js";

export type SpacyTokens = { isMeaningful: boolean; text: string }

const normalizer = (tokens: SpacyTokens[]) => tokens.map(({ text, ...rest }) => ({
  text: normalizeString(text),
  originalText: text,
  ...rest,
}))

export default normalizer