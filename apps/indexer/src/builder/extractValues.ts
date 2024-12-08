import { randomUUID, type UUID } from "crypto"
import _ from "lodash"

type Value = {
  id: UUID
  name: string[]
  sentences: UUID[]
}
type Values = Record<UUID, Value>

type Span = {
  nodeId?: UUID
  start?: number
  end?: number
  words: string[]
}

function matchTitle(title: string, values: Values): Span[] {
  return title
    .split(" ")
    .map((word) => {
      const match = Object.values(values).find((v) => v.name.includes(word))

      return {
        nodeId: match?.id,
        index: match?.name.findIndex((w) => w === word),
        word,
      }
    })
    .reduce((mergedSpans, wordSpan) => {
      const previousSpan = mergedSpans.at(-1)

      const mergeWithPrevious =
        previousSpan &&
        previousSpan.nodeId === wordSpan.nodeId &&
        previousSpan.end === wordSpan.index

      const end = wordSpan.index === undefined ? undefined : wordSpan.index + 1
      return mergeWithPrevious
        ? [
            ...mergedSpans.slice(0, -1),
            {
              nodeId: previousSpan.nodeId,
              start: previousSpan.start,
              end,
              words: [...previousSpan.words, wordSpan.word],
            },
          ]
        : [
            ...mergedSpans,
            {
              nodeId: wordSpan.nodeId,
              start: wordSpan.index,
              end,
              words: [wordSpan.word],
            },
          ]
    }, [] as Span[])
}

const splitValue =
  (sentenceId: UUID) => (value: Value, span: Required<Span>) => ({
    fromSpan: [
      {
        id: value.id,
        name: value.name.slice(span.start, span.end),
        sentences: [...value.sentences, sentenceId],
      },
    ],
    remainingValue: [
      {
        id: randomUUID(),
        name: value.name.slice(0, span.start),
        sentences: value.sentences,
      },
      {
        id: randomUUID(),
        name: value.name.slice(span.end),
        sentences: value.sentences,
      },
    ].filter(({ name }) => !!name.length),
  })

function addAndSplit(initialValues: Values, spans: Span[]): Values {
  const sentenceId = randomUUID()

  const newValues = spans.map((span) => {
    return {
      id: randomUUID(),
      name: span.words,
      sentences:
        span.nodeId !== undefined
          ? [...initialValues[span.nodeId].sentences, sentenceId]
          : [sentenceId],
    }
  })
  const otherValues = Object.values(initialValues).filter((v) =>
    spans.every((s) => s.nodeId !== v.id),
  )
  const remainingValues = Object.values(initialValues)
    .filter((v) => spans.some((s) => s.nodeId === v.id))
    .flatMap((value) =>
      value.name
        .map((word, index) => ({ word, index }))
        .filter(({ word }) => spans.every((span) => !span.words.includes(word)))
        .reduce(
          (values, { word, index }) => {
            const previous = values.at(-1)

            const mergeWithPrevious = previous && previous.endsAt + 1 === index

            return mergeWithPrevious
              ? [
                  ...values.slice(0, -1),
                  {
                    words: [...previous.words, word],
                    endsAt: index,
                  },
                ]
              : [
                  ...values,
                  {
                    words: [word],
                    endsAt: index,
                  },
                ]
          },
          [] as { words: string[]; endsAt: number }[],
        )
        .map((segment) => ({
          id: randomUUID(),
          name: segment.words,
          sentences: value.sentences,
        })),
    )

  return Object.fromEntries(
    [...otherValues, ...newValues, ...remainingValues].map((v) => [v.id, v]),
  )
}

export function extractValues(titles: string[]) {
  return titles.reduce((values: Values, title: string) => {
    const spans = matchTitle(title, values)
    return addAndSplit(values, spans)
  }, {} as Values)
}
