import type { MatchedNodes } from "@tissai/db"

export function createInterpretations(word: string[], nodes: MatchedNodes) {
  return [
    {
      probability: 1,
      score: 1,
      attributes: [],
      category: nodes[0].id,
    },
  ]
}
