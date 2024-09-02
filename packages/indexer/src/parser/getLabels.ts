import { type Token as LexerToken } from "../lexer/index.js"
import { type LabelMap } from "./types.js"

export const getLabels = (map: LabelMap) => (tokens: LexerToken[]) => {
  const getLabel = (word: string) => Object.entries(map[word]).toSorted(([, a], [, b]) => b-a)[0][0]

  return tokens.map((t) => (t.text in map ? getLabel(t.text) : "unknown"))
}
