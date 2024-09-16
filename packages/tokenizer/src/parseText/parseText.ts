import type { RawToken, Scanner } from "./Scanner.js"

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

export const parseText = async (scanner: Scanner, title: string) => {
  const rawTokens = await scanner.tokenize(title)
  return normalizer(rawTokens)
}
