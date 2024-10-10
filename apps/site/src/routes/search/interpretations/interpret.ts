import type { Db } from "@tissai/db"
import { type Interpretation, normalize } from "./normalize.js"
import { calculateProbability } from "./calculateProbability.js"

const BASE_SCORE = { score: 0, interpretations: [] as Interpretation[] }
const pickBestScores = (
  best: typeof BASE_SCORE,
  interpretation: Interpretation,
) => {
  const score = 1 + interpretation.properties.filter((p) => p.value).length

  if (best.score > score) {
    return best
  }
  if (best.score === score) {
    return {
      score: best.score,
      interpretations: [...best.interpretations, interpretation],
    }
  }

  return {
    score,
    interpretations: [interpretation],
  }
}

export async function interpret(words: string[], db: Db) {
  const nodes = await db.nodes.match(words)

  const { category, properties } = nodes
    .map(normalize)
    .flat()
    .reduce(pickBestScores, BASE_SCORE)
    .interpretations.map((i) => ({
      ...i,
      probability: calculateProbability(i),
    }))
    .toSorted((a, b) => b.probability - a.probability)[0]

  return {
    category: category.name,
    properties: properties
      .filter((property) => property.value)
      .map(({ label, value }) => ({
        label: label.name,
        value: value!.name,
      })),
  }
}
