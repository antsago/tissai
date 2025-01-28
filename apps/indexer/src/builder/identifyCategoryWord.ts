import _ from "lodash"
import levenshtein from "fast-levenshtein"

export function identifyCategoryWord(category: string, words: string[]) {
  if (!category) {
    return ""
  }

  const { word: categoryWord, distance } = _.minBy(
    words.map((word) => ({
      word,
      distance: levenshtein.get(category, word, { useCollator: true }),
    })),
    "distance",
  ) ?? { distance: 0 }

  if (!categoryWord || distance === undefined || distance > 2) {
    return ""
  }

  return categoryWord
}
