import type { Labeled } from "./LLM/index.js"

export function extractSchemas(words: Labeled[]) {
  const seenLabels = [] as string[]

  return words
    .filter((word) => !!word.labels)
    .map((word) => {
      const label = word.labels!.find(
        (label) => !seenLabels.includes(label),
      )

      if (!label) {
        return
      }

      seenLabels.push(label)

      return {
        label,
        value: word.value,
      }
    })
    .filter((schema) => !!schema)
}

export type Property = ReturnType<typeof extractSchemas>[number]
