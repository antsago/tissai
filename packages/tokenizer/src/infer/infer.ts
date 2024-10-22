import type { Db, MatchedNodes } from "@tissai/db"
import { type Interpretation, type Property, normalize } from "./normalize.js"
import { calculateProbability } from "./calculateProbability.js"

function calculateScore(interpretation: Interpretation) {
  return 1 + interpretation.properties.filter((p) => p.value).length
}

function pickBestInterpretation(interpretations: Generator<Interpretation>) {
  let bestInterpretation: Interpretation | undefined
  let bestProbability: number | undefined
  let bestScore = 0

  for (let interpretation of interpretations) {
    const score = calculateScore(interpretation)

    if (!bestInterpretation || bestScore < score) {
      bestInterpretation = interpretation
      bestScore = score
      bestProbability = undefined
    } else if (bestScore === score) {
      const probability = calculateProbability(interpretation)
      bestProbability =
        bestProbability ?? calculateProbability(bestInterpretation)

      if (bestProbability < probability) {
        bestInterpretation = interpretation
        bestProbability = probability
      }
    }
  }

  return bestInterpretation
}

function* normalizeNodes(nodes: MatchedNodes) {
  for (let root of nodes) {
    yield* normalize(root)
  }
}

export async function infer(words: string[], db: Db) {
  const nodes = await db.nodes.match(words)
  const interpretations = normalizeNodes(nodes)
  const interpretation = pickBestInterpretation(interpretations)

  return {
    category: interpretation?.category,
    attributes: (interpretation?.properties.filter(
      (property) => property.value,
    ) ?? []) as Required<Property>[],
  }
}
