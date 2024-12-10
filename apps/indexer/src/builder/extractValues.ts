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
  nodeStart?: number
  nodeEnd?: number
  words: string[]
}

export function matchTitle(title: string, values: Values): Span[] {
  type WordSpan = {
    nodeId: UUID | undefined
    nodeIndex: number | undefined
    index: number
    word: string
    duplicated?: true
  }
  type ProtoSpan = Span & { duplicated?: true; end: number }

  return title
    .split(" ")
    .map((word, index) => {
      const match = Object.values(values).find((v) => v.name.includes(word))

      return {
        nodeId: match?.id,
        nodeIndex: match?.name.findIndex((w) => w === word),
        index,
        word,
      } as WordSpan
    })
    .reduce((deduplicated, wordSpan) => {
      const duplicated = deduplicated.findIndex((d) => d.word === wordSpan.word)
      if (duplicated !== -1) {
        return deduplicated.toSpliced(duplicated, 1, {
          ...wordSpan,
          duplicated: true,
        })
      }
      return [...deduplicated, wordSpan]
    }, [] as WordSpan[])
    .reduce((mergedSpans, wordSpan) => {
      const previousSpan = mergedSpans.at(-1)

      const mergeWithPrevious =
        previousSpan &&
        previousSpan.duplicated === wordSpan.duplicated &&
        previousSpan.end === wordSpan.index &&
        previousSpan.nodeId === wordSpan.nodeId &&
        previousSpan.nodeEnd === wordSpan.nodeIndex

      const end = wordSpan.index + 1
      const nodeEnd =
        wordSpan.nodeIndex === undefined ? undefined : wordSpan.nodeIndex + 1

      return mergeWithPrevious
        ? [
            ...mergedSpans.slice(0, -1),
            {
              nodeId: previousSpan.nodeId,
              nodeStart: previousSpan.nodeStart,
              nodeEnd,
              words: [...previousSpan.words, wordSpan.word],
              end,
            },
          ]
        : [
            ...mergedSpans,
            {
              nodeId: wordSpan.nodeId,
              nodeStart: wordSpan.nodeIndex,
              nodeEnd,
              words: [wordSpan.word],
              end,
              duplicated: wordSpan.duplicated,
            },
          ]
    }, [] as ProtoSpan[])
    .map(({ duplicated, end, ...span }) => span)
}

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
