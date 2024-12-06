import { randomUUID, type UUID } from "crypto"

export type Value = {
  name: string[],
  sentences: UUID[]
}

function commonStartBetween(a: string[], b: string[]) {
  let common = [] as string[]
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === undefined || a[i] !== b[i]) {
      return common
    }

    common = [...common, a[i]]
  }

  return common
}

function addTitle(values: Value[], title: string) {
  let remainingWords = title.split(" ")
  const sentenceId = randomUUID()

  const updatedValues = values.map((value) => {
    const match = commonStartBetween(value.name, remainingWords)
    if (!match.length) {
      return value
    }
    
    remainingWords = remainingWords.slice(match.length)
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
