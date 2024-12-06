import { randomUUID, type UUID } from "crypto"

export type Value = {
  name: string[],
  sentences: UUID[]
}

function addTitle(values: Value[], title: string) {
  const words = title.split(" ")
  const sentenceId = randomUUID()

  let isUpdated = false
  const updatedValues = values.map((value) => {
    if (value.name[0] !== words[0]) {
      return value
    }
    
    isUpdated = true
    return {
      ...value,
      sentences: [...value.sentences, sentenceId],
    }
  })

  if (isUpdated) {
    return updatedValues
  }

  return [...values, {
    name: words,
    sentences: [sentenceId],
  }]
}

export function extractValues(titles: string[]) {
  return titles.reduce(addTitle, [] as Value[])
}
