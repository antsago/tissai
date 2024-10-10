import type { MatchedNodes } from "@tissai/db"
import { normalize } from "./normalize.js"
import { calculateProbability } from "./calculateProbability.js"

export function interpret(nodes: MatchedNodes) {
  const interpretations = nodes.map(normalize).flat()

  return interpretations.map((interpretation) => {
    const attributes = interpretation.properties
      .map(({ value }) => value?.name)
      .filter((name) => !!name)

    return {
      probability: calculateProbability(interpretation),
      score: attributes.length + 1,
      attributes,
      category: interpretation.category.name,
    }
  })
}
