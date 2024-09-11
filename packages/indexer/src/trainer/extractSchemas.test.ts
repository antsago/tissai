import { expect, describe, it } from "vitest"
import { type Token } from "../parser/index.js"

function extractSchemas(
  category: string,
  properties: (Token & { labels?: string[] })[],
) {
  return properties
    .filter((token) => !!token.labels)
    .map((property) => ({
      category,
      label: property.labels![0],
      value: property.text,
      tally: 1,
    }))
}

describe("extractSchemas", () => {
  const CATEGORY = "myCategory"
  const WORD_TOKEN = {
    text: "word",
    originalText: "word",
    isMeaningful: true,
    trailing: "",
    labels: ["foo"],
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

  it("Ignores filler words", () => {
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
})
