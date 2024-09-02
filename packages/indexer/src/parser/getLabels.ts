import _ from "lodash"
import { type Token as LexerToken } from "../lexer/index.js"
import { type LabelMap } from "./types.js"

const getCategoryProbability = (vocab?: LabelMap[string]) => {
  if (vocab === undefined) {
    return 0
  }

  const sum = _.sum(Object.entries(vocab).map(([, count]) => count))

  return vocab.categoría ?? 0 / sum
}

export const getLabels = (map: LabelMap) => (tokens: LexerToken[]) => {
  const categoryCandidate = tokens
    .map((t, index) => ({
      probability: getCategoryProbability(map[t.text]),
      index,
    }))
    .sort(({ probability: a }, { probability: b }) => b - a)[0]
  const categoryIndex =
    categoryCandidate.probability === 0 ? undefined : categoryCandidate.index

  const getLabel = (word: string, wordIndex: number) => {
    if (!(word in map)) {
      return undefined
    }

    if (wordIndex === categoryIndex) {
      return "categoría"
    }

    const candidates = Object.entries(map[word])
      .toSorted(([, a], [, b]) => b - a)
      .map(([label]) => label)
    const label = candidates[0]

    return label !== "categoría" ? label : candidates[1]
  }

  return tokens.map((t, i) => getLabel(t.text, i) ?? "unknown")
}
