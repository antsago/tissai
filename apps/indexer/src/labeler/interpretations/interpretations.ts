import type { MatchedNodes } from "@tissai/db"

type Category = MatchedNodes[number]
type Label = NonNullable<Category["children"]>[number]

function labelProbability(label: Label, categoryTally: number) {
  if (!label.children?.length) {
    return (categoryTally - label.tally) / categoryTally
  }

  const value = label.children[0]

  return value.tally / categoryTally
}

function calculateProbability(category: Category) {
  const labels = category.children ?? []
  const multiply = (a: number, b: number) => a * b
  return labels
    .map((label) => labelProbability(label, category.tally))
    .reduce(multiply, category.tally)
}

export function createInterpretations(nodes: MatchedNodes) {
  return nodes.map((category) => {
    const attributes =
      category.children
        ?.map((l) => l.children?.map((v) => v.id) ?? [])
        .flat(Infinity) ?? []

    return {
      probability: calculateProbability(category),
      score: attributes.length + 1,
      attributes,
      category: category.id,
    }
  })
}
