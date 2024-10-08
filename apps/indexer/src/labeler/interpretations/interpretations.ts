import type { MatchedNodes } from "@tissai/db"

function calculateProbability(category: MatchedNodes[number]) {
  if (!category.children?.length) {
    return category.tally
  }

  const label = category.children[0]
  if (!label.children?.length) {
    return category.tally - label.tally
  }

  const value = label.children[0]

  return value.tally
}

export function createInterpretations(words: string[], nodes: MatchedNodes) {
  const category = nodes[0]
  const attributes =
    category.children
      ?.map((l) => l.children?.map((v) => v.id) ?? [])
      .flat(Infinity) ?? []

  return [
    {
      probability: calculateProbability(category),
      score: attributes.length + 1,
      attributes,
      category: category.id,
    },
  ]
}
