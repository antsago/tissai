import { expect, describe, it } from "vitest"
import { Property } from "./LlmLabeler/index.js"
import { extractSchemas } from "./extractSchemas.js"

describe("extractSchemas", () => {
  const WORD_PROPERTY = {
    value: "word",
    labels: ["foo", "bar"],
  }

  it("converts property to schema", () => {
    const properties = [WORD_PROPERTY]

    const result = extractSchemas(properties)

    expect(result).toStrictEqual([
      {
        label: WORD_PROPERTY.labels[0],
        value: WORD_PROPERTY.value,
        tally: 1,
      },
    ])
  })

  it("handles several properties", () => {
    const properties = [
      {
        ...WORD_PROPERTY,
        value: "foo",
        labels: ["bar"],
      },
      {
        ...WORD_PROPERTY,
        value: "foobar",
        labels: ["foobar"],
      },
    ]

    const result = extractSchemas(properties)

    expect(result).toStrictEqual([
      {
        label: "bar",
        value: "foo",
        tally: 1,
      },
      {
        label: "foobar",
        value: "foobar",
        tally: 1,
      },
    ])
  })

  it("ignores filler words", () => {
    const properties = [
      {
        ...WORD_PROPERTY,
        value: "filler",
        labels: undefined,
      },
      {
        ...WORD_PROPERTY,
        value: "foobar",
        labels: ["foobar"],
      },
    ] as Property[]

    const result = extractSchemas(properties)

    expect(result).toStrictEqual([
      {
        label: "foobar",
        value: "foobar",
        tally: 1,
      },
    ])
  })

  it("avoids duplicate labels", () => {
    const properties = [
      {
        ...WORD_PROPERTY,
        value: "foo",
      },
      {
        ...WORD_PROPERTY,
        value: "bar",
      },
    ]

    const result = extractSchemas(properties)

    expect(result).toStrictEqual([
      {
        label: WORD_PROPERTY.labels[0],
        value: "foo",
        tally: 1,
      },
      {
        label: WORD_PROPERTY.labels[1],
        value: "bar",
        tally: 1,
      },
    ])
  })

  it("ignores properties without fallback labels", () => {
    const properties = [WORD_PROPERTY, WORD_PROPERTY, WORD_PROPERTY]

    const result = extractSchemas(properties)

    expect(result).toStrictEqual([
      {
        label: WORD_PROPERTY.labels[0],
        value: WORD_PROPERTY.value,
        tally: 1,
      },
      {
        label: WORD_PROPERTY.labels[1],
        value: WORD_PROPERTY.value,
        tally: 1,
      },
    ])
  })
})
