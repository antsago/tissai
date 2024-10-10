import type { MatchedNodes } from "@tissai/db"
import { normalize, type Interpretation } from "./normalize.js"

function calculateProbability({ category, properties }: Interpretation) {
  const multiply = (a: number, b: number) => a * b
  return properties
    .map(({ value, label }) =>
      value !== undefined
        ? value.tally / category.tally
        : (category.tally - label.tally) / category.tally,
    )
    .reduce(multiply, category.tally)
}

export function createInterpretations(nodes: MatchedNodes) {
  const interpretations = nodes.map(normalize).flat()

  return interpretations.map((interpretation) => {
    const attributes = interpretation.properties
      .map(({ value }) => value?.id)
      .filter((id) => !!id)

    return {
      probability: calculateProbability(interpretation),
      score: attributes.length + 1,
      attributes,
      category: interpretation.category.id,
    }
  })
}
