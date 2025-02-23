import type { RawToken, Lexer } from "./Lexer.js"

const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

export const normalizer = (tokens: RawToken[]) =>
  tokens.map(({ text, ...rest }) => ({
    text: normalizeString(text),
    originalText: text,
    ...rest,
  }))

export type Token = ReturnType<typeof normalizer>[number]

export const parseText = async (lexer: Lexer, title: string) => {
  const rawTokens = await lexer.tokenize(title)
  return normalizer(rawTokens)
}
