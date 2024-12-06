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

type Match = {
  common: string[]
  valueIndex: number
}

function splitValues(values: Value[], match: Match|undefined, sentenceId: UUID) {
  if (!match) {
    return values
  }
  const value = values[match.valueIndex]

  return values.toSpliced(
    match.valueIndex,
    1,
    ...[
      {
        name: match.common,
        sentences: [...value.sentences, sentenceId],
      },
      {
        name: value.name.slice(match.common.length),
        sentences: value.sentences,
      },
    ].filter(({name}) => !!name.length)
  )
}

function matchTitle(title: string, values: Value[]) {
  const words = title.split(" ")

  const span = values.map((value, valueIndex) => {
    const common = commonStartBetween(value.name, words)
    return {common, valueIndex}
  }).filter(({ common }) => !!common.length).at(0)

  const remainingWords = words.slice(span?.common.length ?? 0)

  return {
    span,
    remainingWords,
  }
}

function addTitle(values: Value[], title: string) {
  const sentenceId = randomUUID()
  const { span, remainingWords } = matchTitle(title, values)
  const updatedValues = splitValues(values, span, sentenceId)

  return [
    ...updatedValues,
    ...(remainingWords.length ? [{
      name: remainingWords,
      sentences: [sentenceId],
    }] : [])
  ]
}

export function extractValues(titles: string[]) {
  return titles.reduce(addTitle, [] as Value[])
}
