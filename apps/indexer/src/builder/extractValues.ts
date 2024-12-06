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
  let splitValues = [] as Value[]

  const updatedValues = values.map((value) => {
    const match = commonStartBetween(value.name, remainingWords)
    if (!match.length) {
      return value
    }

    if(match.length < value.name.length) {
      splitValues = [
        ...splitValues,
        {
          name: value.name.slice(match.length),
          sentences: value.sentences,
        }
      ]

    }
    
    remainingWords = remainingWords.slice(match.length)
    return {
      name: match,
      sentences: [...value.sentences, sentenceId],
    }
  })

  return [
    ...updatedValues,
    ...splitValues,
    ...(!remainingWords.length ? [] : [{
      name: remainingWords,
      sentences: [sentenceId],
    }])
  ]
}

export function extractValues(titles: string[]) {
  return titles.reduce(addTitle, [] as Value[])
}
