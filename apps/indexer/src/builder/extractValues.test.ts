import { expect, describe, it } from "vitest"
import { extractValues } from "./extractValues"

describe("extractValues", () => {
  it("adds new titles as values", () => {
    const titles = ["jeans camel"]

    const result = extractValues(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "camel"],
        sentences: [expect.any(String)],
      },
    ])
  })

  it("adds several new values", () => {
    const titles = ["jeans camel", "vaqueros azul"]

    const result = extractValues(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "camel"],
        sentences: [expect.any(String)],
      },
      {
        name: ["vaqueros", "azul"],
        sentences: [expect.any(String)],
      },
    ])
  })

  it("does not add existing values", () => {
    const titles = ["jeans", "jeans"]

    const result = extractValues(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans"],
        sentences: [expect.any(String), expect.any(String)],
      },
    ])
  })

  it("adds non-matched words", () => {
    const titles = ["jeans", "jeans regular camel"]

    const result = extractValues(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans"],
        sentences: [expect.any(String), expect.any(String)],
      },
      {
        name: ["regular", "camel"],
        sentences: [result[0].sentences[1]],
      },
    ])
  })

  it("matches multiple words", () => {
    const titles = ["jeans camel", "jeans camel"]

    const result = extractValues(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "camel"],
        sentences: [expect.any(String), expect.any(String)],
      },
    ])
  })

  it("splits at common initial words", () => {
    const titles = ["jeans camel", "jeans"]

    const result = extractValues(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans"],
        sentences: [expect.any(String), expect.any(String)],
      },
      {
        name: ["camel"],
        sentences: [result[0].sentences[0]],
      },
    ])
  })

  it("matches multiple initial words", () => {
    const titles = ["jeans regular camel", "jeans regular"]

    const result = extractValues(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "regular"],
        sentences: [expect.any(String), expect.any(String)],
      },
      {
        name: ["camel"],
        sentences: [result[0].sentences[0]],
      },
    ])
  })
})
