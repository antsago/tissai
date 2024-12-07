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

function matchSpan(span: Span, values: Value[]) {
  for (let [valueEntry, value] of values.entries()) {
    const match = commonStartBetween(span.words, value.name)

    if (match.length) {
      return { common: match, value: valueEntry }
    }
  }
}

const splitFirstWord = (span: Span) => {
  const splitSpan = { words: [span.words[0]] }

  const remainingSpan =
    span.words.length > 1 ? [{ words: span.words.slice(1) }] : []

  return [splitSpan, ...remainingSpan]
}

const moveFirstWord = (span: Span, previousSpan: Span) => {
  const newSpan = { words: [...previousSpan.words, span.words[0]] }

  const remainingSpan =
    span.words.length > 1 ? [{ words: span.words.slice(1) }] : []

  return [newSpan, ...remainingSpan]
}

const splitByMatch = (
  span: Span,
  match: NonNullable<ReturnType<typeof matchSpan>>,
) => {
  const matchedSpan = { words: match.common, nodeId: match.value }

  const remainingSpan =
    span.words.length > match.common.length
      ? [{ words: span.words.slice(match.common.length) }]
      : []

  return [matchedSpan, ...remainingSpan]
}

function matchTitle(title: string, values: Value[]): Span[] {
  const words = title.split(" ")

  let spans: Span[] = [{ words }]
  let currentSpan = 0

  while (spans[currentSpan]) {
    const span = spans[currentSpan]

    if (span.nodeId !== undefined) {
      currentSpan += 1
      continue
    }

    const match = matchSpan(span, values)

    if (match) {
      const splitSpans = splitByMatch(span, match)
      spans = spans.toSpliced(currentSpan, 1, ...splitSpans)
      currentSpan += 1
      continue
    }

    const previousSpan = spans[currentSpan - 1]
    if (previousSpan && previousSpan.nodeId === undefined) {
      const updatedSpans = moveFirstWord(span, previousSpan)
      spans = spans.toSpliced(currentSpan - 1, 2, ...updatedSpans)
      continue
    }

    const splitSpans = splitFirstWord(span)
    spans = spans.toSpliced(currentSpan, 1, ...splitSpans)
    currentSpan += 1
    continue
  }

  return spans
}

const splitValue =
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
    .reduce(splitValue(sentenceId), initialValues)

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
