import { expect, describe, it } from "vitest"
import { getLabels } from "./getLabels.js"

describe("getLabels", () => {
  const WORD_TOKEN = {
    text: "word",
    originalText: "word",
    isMeaningful: true,
    trailing: "",
  }
  const SCHEMAS = {}

  it("returns 'unknown' for unknown words", () => {
    const vocabulary = {}
    const result = getLabels({ schemas: SCHEMAS, vocabulary })([WORD_TOKEN])

    expect(result).toStrictEqual(["unknown"])
  })

  it("returns most frequent label", () => {
    const vocabulary = { [WORD_TOKEN.text]: { unfrequent: 1, frequent: 10 } }
    const result = getLabels({ schemas: SCHEMAS, vocabulary })([WORD_TOKEN])

    expect(result).toStrictEqual(["frequent"])
  })

  it("returns single category label", () => {
    const vocabulary = {
      theCategory: { categoría: 10 },
      word1: { categoría: 4, label: 2 },
      word2: { categoría: 5 },
    }
    const result = getLabels({ schemas: SCHEMAS, vocabulary })([
      {
        ...WORD_TOKEN,
        text: "word1",
      },
      {
        ...WORD_TOKEN,
        text: "theCategory",
      },
      {
        ...WORD_TOKEN,
        text: "word2",
      },
    ])

    expect(result).toStrictEqual(["label", "categoría", "unknown"])
  })

  it("update label probabilities with schema", () => {
    const vocabulary = {
      theCategory: { categoría: 10 },
      word1: { categoría: 4, label: 2 },
      word2: { categoría: 5 },
    }
    const result = getLabels({ schemas: SCHEMAS, vocabulary })([
      {
        ...WORD_TOKEN,
        text: "word1",
      },
      {
        ...WORD_TOKEN,
        text: "theCategory",
      },
      {
        ...WORD_TOKEN,
        text: "word2",
      },
    ])

    expect(result).toStrictEqual(["label", "categoría", "unknown"])
  })
})
