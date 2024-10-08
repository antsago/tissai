import type { MatchedNodes } from "@tissai/db"

export function createInterpretations(word: string[], nodes: MatchedNodes) {
  const labelTally = nodes[0].children?.[0].tally ?? false
  const categoryTally = nodes[0].tally

  return [
    {
      probability: labelTally === false ? categoryTally : (categoryTally - labelTally) / categoryTally,
      score: 1,
      attributes: [],
      category: nodes[0].id,
    },
  ]
}
