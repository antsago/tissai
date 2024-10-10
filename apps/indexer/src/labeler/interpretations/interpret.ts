import type { MatchedNodes } from "@tissai/db"
import { normalize } from "./normalize.js"
import { calculateProbability } from "./calculateProbability.js"

export function interpret(nodes: MatchedNodes) {
  const interpretations = nodes.map(normalize).flat()

  return interpretations.map(({ category, properties}) => {
    return {
      category: category.name,
      properties: properties.filter(property => property.value).map(({ label, value}) => ({ label: label.name, value: value!.name })) 
    }
  }).toSorted((a,b) => b.properties.length - a.properties.length)[0]
}
