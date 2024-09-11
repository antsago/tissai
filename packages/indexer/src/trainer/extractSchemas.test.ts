import { expect, describe, it } from "vitest"
import { extractSchemas } from "./extractSchemas.js"

describe("extractSchemas", () => {
  const CATEGORY = "myCategory"
  const WORD_TOKEN = {
    text: "word",
    originalText: "word",
    isMeaningful: true,
    trailing: "",
    labels: ["foo", "bar"],
  }

  it("converts property to schema", () => {
    const properties = [WORD_TOKEN]

    const result = extractSchemas(CATEGORY, properties)

    expect(result).toStrictEqual([
      {
        category: CATEGORY,
        label: WORD_TOKEN.labels[0],
        value: WORD_TOKEN.text,
        tally: 1,
      },
    ])
  })

  it("handles several properties", () => {
    const properties = [
      {
        ...WORD_TOKEN,
        text: "foo",
        labels: ["bar"],
      },
      {
        ...WORD_TOKEN,
        text: "foobar",
        labels: ["foobar"],
      },
    ]

    const result = extractSchemas(CATEGORY, properties)

    expect(result).toStrictEqual([
      {
        category: CATEGORY,
        label: "bar",
        value: "foo",
        tally: 1,
      },
      {
        category: CATEGORY,
        label: "foobar",
        value: "foobar",
        tally: 1,
      },
    ])
  })

  it("ignores filler words", () => {
    const properties = [
      {
        ...WORD_TOKEN,
        text: "filler",
        labels: undefined,
      },
      {
        ...WORD_TOKEN,
        text: "foobar",
        labels: ["foobar"],
      },
    ]

    const result = extractSchemas(CATEGORY, properties)

    expect(result).toStrictEqual([
      {
        category: CATEGORY,
        label: "foobar",
        value: "foobar",
        tally: 1,
      },
    ])
  })

  it("avoids duplicate labels", () => {
    const properties = [
      {
        ...WORD_TOKEN,
        text: "foo",
      },
      {
        ...WORD_TOKEN,
        text: "bar",
      },
    ]

    const result = extractSchemas(CATEGORY, properties)

    expect(result).toStrictEqual([
      {
        category: CATEGORY,
        label: WORD_TOKEN.labels[0],
        value: "foo",
        tally: 1,
      },
      {
        category: CATEGORY,
        label: WORD_TOKEN.labels[1],
        value: "bar",
        tally: 1,
      },
    ])
  })

  it("ignores properties without fallback labels", () => {
    const properties = [WORD_TOKEN, WORD_TOKEN, WORD_TOKEN]

    const result = extractSchemas(CATEGORY, properties)

    expect(result).toStrictEqual([
      {
        category: CATEGORY,
        label: WORD_TOKEN.labels[0],
        value: WORD_TOKEN.text,
        tally: 1,
      },
      {
        category: CATEGORY,
        label: WORD_TOKEN.labels[1],
        value: WORD_TOKEN.text,
        tally: 1,
      },
    ])
  })
})
