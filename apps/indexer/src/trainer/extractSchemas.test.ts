import { expect, describe, it } from "vitest"
import { Labeled } from "./LlmLabeler/index.js"
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
      },
      {
        label: "foobar",
        value: "foobar",
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
    ] as Labeled[]

    const result = extractSchemas(properties)

    expect(result).toStrictEqual([
      {
        label: "foobar",
        value: "foobar",
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
      },
      {
        label: WORD_PROPERTY.labels[1],
        value: "bar",
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
      },
      {
        label: WORD_PROPERTY.labels[1],
        value: WORD_PROPERTY.value,
      },
    ])
  })
})
