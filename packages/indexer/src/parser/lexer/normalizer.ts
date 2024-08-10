import { normalizeString } from "../../schemaExtractor/normalize.js";

export type SpacyTokens = { isMeaningful: boolean; text: string }

export const normalizer = (tokens: SpacyTokens[]) => tokens.map(({ text, ...rest }) => ({
  text: normalizeString(text),
  originalText: text,
  ...rest,
}))
