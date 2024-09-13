import type { Property } from "./LlmLabeler/index.js"

export function extractSchemas(category: string, properties: Property[]) {
  const seenLabels = [] as string[]

  return properties
    .filter((token) => !!token.labels)
    .map((property) => {
      const label = property.labels!.find(
        (label) => !seenLabels.includes(label),
      )

      if (!label) {
        return
      }

      seenLabels.push(label)

      return {
        category,
        label,
        value: property.value,
        tally: 1,
      }
    })
    .filter((schema) => !!schema)
}
