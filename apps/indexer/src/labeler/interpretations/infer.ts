import type { Db, MatchedNodes } from "@tissai/db"
import {
  type Interpretation,
  Node,
  normalize,
  type Property,
} from "./normalize.js"
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

function* normalizeNodes(nodes: MatchedNodes) {
  for (let root of nodes) {
    yield* normalize(root)
  }
}

export async function infer(words: string[], db: Db) {
  const nodes = await db.nodes.match(words)

  let bestScore = 0
  let bestInterpretation: Interpretation | undefined
  let bestProbability: number | undefined
  for (let interpretation of normalizeNodes(nodes)) {
    const score = 1 + interpretation.properties.filter((p) => p.value).length

    if (!bestInterpretation || bestScore < score) {
      bestInterpretation = interpretation
      bestScore = score
      bestProbability = undefined
    } else if (bestScore === score) {
      bestProbability = bestProbability ?? calculateProbability(bestInterpretation)
      const probability = calculateProbability(interpretation)

      if (bestProbability < probability) {
        bestInterpretation = interpretation
        bestProbability = probability
      }
    }
  }

  return {
    category: bestInterpretation?.category,
    attributes: (bestInterpretation?.properties.filter(
      (property) => property.value,
    ) ?? []) as Required<Property>[],
  }
}
