import { randomUUID, type UUID } from "crypto"

type Value = {
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

      const newSpans =
        span.words.length > match.length
          ? [{ words: span.words.slice(match.length) }]
          : []
      spans = spans.toSpliced(
        currentSpan,
        1,
        { words: match, nodeId: valueEntry },
        ...newSpans,
      )
      currentSpan += 1
      continue spanLoop
    }

    const unmatchedWord = span.words[0]
    const newSpans =
      span.words.length > 1 ? [{ words: span.words.slice(1) }] : []
    const previousSpan = spans[currentSpan - 1]
    if (previousSpan && previousSpan.nodeId === undefined) {
      spans = spans.toSpliced(
        currentSpan - 1,
        2,
        { words: [...previousSpan.words, unmatchedWord] },
        ...newSpans,
      )
    } else {
      spans = spans.toSpliced(
        currentSpan,
        1,
        { words: [unmatchedWord] },
        ...newSpans,
      )
      currentSpan += 1
    }
  }

  return spans
}

const splitSpan =
  (sentenceId: UUID) =>
  (values: Value[], span: Span): Value[] => {
    const value = values[span.nodeId!]

    const matchedSpan = {
      name: span.words,
      sentences: [...value.sentences, sentenceId],
    }
    const unmatchedSpan = {
      name: value.name.slice(span.words.length),
      sentences: value.sentences,
    }
    const newValues = [matchedSpan, unmatchedSpan].filter(
      ({ name }) => !!name.length,
    )

    return values.toSpliced(span.nodeId!, 1, ...newValues)
  }

function addAndSplit(initialValues: Value[], spans: Span[]) {
  const sentenceId = randomUUID()

  const splitValues = spans
    .filter((s) => s.nodeId !== undefined)
    .reduce(splitSpan(sentenceId), initialValues)

  const newValues = spans
    .filter((s) => s.nodeId === undefined)
    .map((s) => ({ name: s.words, sentences: [sentenceId] }))

  return [...splitValues, ...newValues]
}

function addTitle(values: Value[], title: string) {
  const spans = matchTitle(title, values)
  return addAndSplit(values, spans)
}

export function extractValues(titles: string[]) {
  return titles.reduce(addTitle, [] as Value[])
}
