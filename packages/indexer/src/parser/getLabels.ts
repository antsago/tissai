import _ from "lodash"
import { type Token as LexerToken } from "../lexer/index.js"
import { Model, type LabelMap } from "./types.js"

const getCategoryProbability = (vocab?: LabelMap[string]) => {
  if (vocab === undefined) {
    return 0
  }

  const sum = _.sum(Object.entries(vocab).map(([, count]) => count))

  return vocab.categoría ?? 0 / sum
}

const getLabel = (vocab?: LabelMap[string]) => {
  if (!vocab) {
    return undefined
  }

  const candidates = Object.entries(vocab)
    .toSorted(([, a], [, b]) => b - a)
    .map(([label]) => label)
  const label = candidates[0]

  return label !== "categoría" ? label : candidates[1]
}

export const getLabels =
  ({ vocabulary, schemas }: Model) =>
  (tokens: LexerToken[]) => {
    const category = tokens
      .map((t, index) => ({
        probability: getCategoryProbability(vocabulary[t.text]),
        index,
      }))
      .sort(({ probability: a }, { probability: b }) => b - a)[0]

    const labels = tokens.map((t) => getLabel(vocabulary[t.text]) ?? "unknown")

    return category.probability === 0
      ? labels
      : labels.toSpliced(category.index, 1, "categoría")
  }
