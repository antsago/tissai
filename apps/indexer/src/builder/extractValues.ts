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
      if (
        previousSpan &&
        previousSpan.nodeId === wordSpan.nodeId &&
        ((previousSpan.end === undefined && wordSpan.index === undefined) ||
          (previousSpan.end !== undefined &&
            wordSpan.index !== undefined &&
            previousSpan.end + 1 === wordSpan.index))
      ) {
        return [
          ...mergedSpans.slice(0, -1),
          {
            nodeId: previousSpan.nodeId,
            start: previousSpan.start,
            end: wordSpan.index,
            words: [...previousSpan.words, wordSpan.word],
          },
        ]
      }

      return [
        ...mergedSpans,
        {
          nodeId: wordSpan.nodeId,
          start: wordSpan.index,
          end: wordSpan.index,
          words: [wordSpan.word],
        },
      ]
    }, [] as Span[])
}

const splitValue =
  (sentenceId: UUID) =>
  (values: Values, span: Required<Span>): Values => {
    const value = values[span.nodeId]

    const newValues = [
      {
        id: randomUUID(),
        name: value.name.slice(0, span.start),
        sentences: value.sentences,
      },
      {
        id: value.id,
        name: value.name.slice(span.start, span.end + 1),
        sentences: [...value.sentences, sentenceId],
      },
      {
        id: randomUUID(),
        name: value.name.slice(span.end + 1),
        sentences: value.sentences,
      },
    ]
      .filter(({ name }) => !!name.length)
      .map((v) => [v.id, v])

    return {
      ...values,
      ...Object.fromEntries(newValues),
    }
  }

function addAndSplit(initialValues: Values, spans: Span[]): Values {
  const sentenceId = randomUUID()

  const splitValues = spans
    .filter((s) => s.nodeId !== undefined)
    .reduce(
      (v, s) => splitValue(sentenceId)(v, s as Required<Span>),
      initialValues,
    )

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
