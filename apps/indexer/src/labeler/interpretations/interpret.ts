import type { MatchedNodes } from "@tissai/db"
import { type Interpretation, normalize } from "./normalize.js"
import { calculateProbability } from "./calculateProbability.js"

export function interpret(nodes: MatchedNodes) {
  return nodes.map(normalize).flat().reduce((best, interpretation) => {
    const score = 1 + interpretation.properties.filter(p => p.value).length

    if (best.score > score) {
      return best
    }
    if (best.score === score) {
      return {
        score: best.score,
        interpretations: [...best.interpretations, interpretation]
      }
    }

    return {
      score,
      interpretations: [interpretation],
    }
  }, { score: 0, interpretations: [] as Interpretation[] }).interpretations.map(({ category, properties}) => {
    return {
      category: category.name,
      properties: properties.filter(property => property.value).map(({ label, value}) => ({ label: label.name, value: value!.name })) 
    }
  })[0]
}
