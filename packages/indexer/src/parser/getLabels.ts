import { type Token as LexerToken } from "../lexer/index.js"
import { type LabelMap } from "./types.js"

export const getLabels = (map: LabelMap) => (tokens: LexerToken[]) => {
  let foundCategory = false

  const getLabel = (word: string) => {
    if (!(word in map)) {
      return undefined
    }

    const candidates = Object.entries(map[word]).toSorted(([, a], [, b]) => b-a).map(([label]) => label)
    const label = candidates[0]
    if (label !== "categoría") {
      return label
    }

    if (!foundCategory) {
      foundCategory = true
      return label
    }

    return candidates[1]
  }

  return tokens.map((t) => getLabel(t.text) ?? "unknown")
}
