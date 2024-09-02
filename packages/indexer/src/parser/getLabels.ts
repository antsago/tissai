import _ from "lodash"
import { type Token as LexerToken } from "../lexer/index.js"
import { Model, type LabelMap } from "./types.js"

const getCategoryProbability = (vocable?: LabelMap[string]) => {
  if (vocable === undefined) {
    return 0
  }

  const sum = _.sum(Object.entries(vocable).map(([, count]) => count))

  return (vocable.categoría ?? 0) / sum
}

const getLabel = (vocable?: { label: string, count: number}[]) => {
  if (!vocable) {
    return undefined
  }

  const candidates = vocable
    .toSorted(({ count: a }, { count: b }) => b - a)
    .map(({ label }) => label)

  return candidates[0] !== "categoría" ? candidates[0] : candidates[1]
}

export const getLabels =
  ({ vocabulary, schemas }: Model) =>
  (tokens: LexerToken[]) => {
    const category = tokens
      .map((t, index) => ({
        probability: getCategoryProbability(vocabulary[t.text]),
        index,
        value: t.text,
      }))
      .sort(({ probability: a }, { probability: b }) => b - a)[0]

    const getVocable = (word: string) => {
      if (!(word in vocabulary)) {
        return undefined
      } 

      return Object.entries(vocabulary[word]).map(([label, count]) => ({ label, count: (schemas[category.value]?.[label] ?? 1) * count }))
    }

    const labels = tokens.map((t) => getVocable(t.text))
      .map((vocab) => getLabel(vocab) ?? "unknown")

    return category.probability === 0
      ? labels
      : labels.toSpliced(category.index, 1, "categoría")
  }
