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
  (sentenceId: UUID) => (value: Values[UUID], span: Required<Span>) => {
    return [
      {
        id: randomUUID(),
        name: value.name.slice(0, span.start),
        sentences: value.sentences,
      },
      {
        id: value.id,
        name: value.name.slice(span.start, span.end),
        sentences: [...value.sentences, sentenceId],
      },
      {
        id: randomUUID(),
        name: value.name.slice(span.end),
        sentences: value.sentences,
      },
    ].filter(({ name }) => !!name.length)
  }

function addAndSplit(initialValues: Values, spans: Span[]): Values {
  const sentenceId = randomUUID()

  const newValues = spans
    .map((span) =>
      span.nodeId !== undefined
        ? splitValue(sentenceId)(
            initialValues[span.nodeId],
            span as Required<Span>,
          )
        : {
            id: randomUUID(),
            name: span.words,
            sentences: [sentenceId],
          },
    )
    .flat()
    .reduce((values, value) => {
      return {
        ...values,
        [value.id]: value,
      }
    }, initialValues)

  return {
    ...initialValues,
    ...newValues,
  }
}

export function extractValues(titles: string[]) {
  return titles.reduce((values: Values, title: string) => {
    const spans = matchTitle(title, values)
    return addAndSplit(values, spans)
  }, {} as Values)
}
