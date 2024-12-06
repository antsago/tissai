import { randomUUID, type UUID } from "crypto"

export type Value = {
  name: string[]
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

type Span = {
  nodeId?: number
  words: string[]
}

function matchTitle(title: string, values: Value[]): Span[] {
  const words = title.split(" ")

  let spans: Span[] = [{ words }]
  let currentSpan = 0
  
  spanLoop: while (spans[currentSpan]) {
    const span = spans[currentSpan]

    if (span.nodeId !== undefined) {
      currentSpan += 1
      continue spanLoop
    }

    valueLoop: for (let [valueEntry, value] of values.entries()) {
      const match = commonStartBetween(span.words, value.name)

      if (!match.length) {
        continue valueLoop
      }

      if (match.length === span.words.length) {
        spans = spans.toSpliced(currentSpan, 1, {...span, nodeId: valueEntry })
      } else if (match.length < span.words.length) {
        spans = spans.toSpliced(currentSpan, 1, 
          { words: match, nodeId: valueEntry},
          { words: span.words.slice(match.length)}
        )
      }

      currentSpan += 1
      continue spanLoop
    }

    const unmatchedWord = span.words[0]
    const remainingWords = span.words.slice(1)
    const previousSpan = spans[currentSpan - 1]
    if (previousSpan && previousSpan.nodeId === undefined) {
      spans = remainingWords.length
        ? spans.toSpliced(
            currentSpan - 1,
            2,
            { words: [...previousSpan.words, unmatchedWord] },
            { words: remainingWords },
          )
        : spans.toSpliced(currentSpan - 1, 2, {
            words: [...previousSpan.words, unmatchedWord],
          })
      continue spanLoop
    }

    if (remainingWords.length) {
      spans = spans.toSpliced(
        currentSpan,
        1,
        { words: [unmatchedWord] },
        { words: remainingWords },
      )
    }
    currentSpan += 1
  }

  return spans
}

function addTitle(initialValues: Value[], title: string) {
  const sentenceId = randomUUID()
  const spans = matchTitle(title, initialValues)

  const splitValues = spans.filter(s => s.nodeId !== undefined).reduce((values, span) => {
    const value = values[span.nodeId!]
    return values.toSpliced(
      span.nodeId!,
      1,
      ...[
        {
          name: span.words,
          sentences: [...value.sentences, sentenceId],
        },
        {
          name: value.name.slice(span.words.length),
          sentences: value.sentences,
        },
      ].filter(({ name }) => !!name.length),
    )
  }, initialValues)
  const newValues = spans.filter(s => s.nodeId === undefined).map(s => ({ name: s.words, sentences: [sentenceId]}))

  return [
    ...splitValues,
    ...newValues,
  ]
}

export function extractValues(titles: string[]) {
  return titles.reduce(addTitle, [] as Value[])
}
