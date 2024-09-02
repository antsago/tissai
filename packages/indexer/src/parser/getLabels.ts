import { type Token as LexerToken } from "../lexer/index.js"
import { type LabelMap } from "./types.js"

export const getLabels = (map: LabelMap) => (tokens: LexerToken[]) =>
  tokens.map((t) => (t.text in map ? Object.keys(map[t.text])[0] : "unknown"))
