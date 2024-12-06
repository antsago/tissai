import { randomUUID, type UUID } from "crypto"

export type Value = {
  name: string[],
  sentences: UUID[]
}

function addTitle(values: Value[], title: string) {
  let remainingWords = title.split(" ")
  const sentenceId = randomUUID()

  const updatedValues = values.map((value) => {
    if (value.name[0] !== remainingWords[0]) {
      return value
    }
    
    remainingWords = remainingWords.slice(1)
    return {
      ...value,
      sentences: [...value.sentences, sentenceId],
    }
  })

  if (!remainingWords.length) {
    return updatedValues
  }

  return [...updatedValues, {
    name: remainingWords,
    sentences: [sentenceId],
  }]
}

export function extractValues(titles: string[]) {
  return titles.reduce(addTitle, [] as Value[])
}
