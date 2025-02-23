import { type UUID } from "crypto"

export type Value = {
  name: string[]
  sentences: UUID[]
}
type Property = {
  name: string
  sentences: UUID[]
}[]

function groupProperties(values: Value[]): Property[] {
  if (!values.length) {
    return []
  }

  let seenSentences = [] as UUID[]
  let skippedValues = [] as Value[]

  const property = values
    .filter((value) => {
      const skipValue = value.sentences.some((s) => seenSentences.includes(s))

      if (skipValue) {
        skippedValues = [...skippedValues, value]
      } else {
        seenSentences = [...seenSentences, ...value.sentences]
      }

      return !skipValue
    })
    .map((v) => ({
      name: v.name.join(" "),
      sentences: v.sentences,
    }))

  return [property, ...groupProperties(skippedValues)]
}

export function extractProperties(values: Value[]): Property[] {
  return groupProperties(
    values.toSorted((a, b) => b.sentences.length - a.sentences.length),
  )
}
