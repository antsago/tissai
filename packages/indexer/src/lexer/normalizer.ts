import { type RawToken } from "./Scanner.js";

export const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

export const normalizer = (tokens: RawToken[]) => tokens.map(({ text, ...rest }) => ({
  text: normalizeString(text),
  originalText: text,
  ...rest,
}))

export type Token = ReturnType<typeof normalizer>[number]
