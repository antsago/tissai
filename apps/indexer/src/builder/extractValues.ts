import { randomUUID, type UUID } from "crypto"

type Values = Record<
  UUID,
  {
    id: UUID
    name: string[]
    sentences: UUID[]
  }
>

type Span = {
  nodeId?: UUID
  words: string[]
}

function matchTitle(title: string, values: Values): Span[] {
  const words = title.split(" ")

  const wordSpans = words.map((word) => {
    const match = Object.values(values).find((v) => v.name.includes(word))

    return {
      nodeId: match?.id,
      word,
    }
  })

  return wordSpans.reduce((mergedSpans, wordSpan) => {
    const previousSpan = mergedSpans.at(-1)
    if (previousSpan && previousSpan.nodeId === wordSpan.nodeId) {
      return [
        ...mergedSpans.slice(0, -1),
        {
          nodeId: previousSpan.nodeId,
          words: [...previousSpan.words, wordSpan.word],
        },
      ]
    }

    return [
      ...mergedSpans,
      {
        nodeId: wordSpan.nodeId,
        words: [wordSpan.word],
      },
    ]
  }, [] as Span[])
}

const splitValue =
  (sentenceId: UUID) =>
  (values: Values, span: Span): Values => {
    const value = values[span.nodeId!]

    const matchedSpan = {
      id: value.id,
      name: span.words,
      sentences: [...value.sentences, sentenceId],
    }
    const unmatchedSpan = {
      id: randomUUID(),
      name: value.name.slice(span.words.length),
      sentences: value.sentences,
    }
    const newValues = [
      [matchedSpan.id, matchedSpan] as const,
      [unmatchedSpan.id, unmatchedSpan] as const,
    ].filter(([, { name }]) => !!name.length)

    return {
      ...values,
      ...Object.fromEntries(newValues),
    }
  }

function addAndSplit(initialValues: Values, spans: Span[]): Values {
  const sentenceId = randomUUID()

  const splitValues = spans
    .filter((s) => s.nodeId !== undefined)
    .reduce(splitValue(sentenceId), initialValues)

  const newValues = Object.fromEntries(
    spans
      .filter((s) => s.nodeId === undefined)
      .map((s) => {
        const id = randomUUID()
        return [
          id,
          {
            id,
            name: s.words,
            sentences: [sentenceId],
          },
        ]
      }),
  )

  return {
    ...splitValues,
    ...newValues,
  }
}

export function extractValues(titles: string[]) {
  return titles.reduce((values: Values, title: string) => {
    const spans = matchTitle(title, values)
    return addAndSplit(values, spans)
  }, {} as Values)
}
