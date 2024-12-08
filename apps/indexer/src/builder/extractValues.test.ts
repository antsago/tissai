import { expect, describe, it } from "vitest"
import { extractValues as extractRaw } from "./extractValues"

const extractValues = (titles: string[]) =>
  Object.values(extractRaw(titles)).map((v) => ({
    name: v.name,
    sentences: v.sentences,
  }))

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

  it("adds initial remaining words", () => {
    const titles = ["vaqueros", "pantalones vaqueros"]

    const result = extractValues(titles)

    expect(result).toStrictEqual([
      {
        name: ["vaqueros"],
        sentences: [expect.any(String), expect.any(String)],
      },
      {
        name: ["pantalones"],
        sentences: [result[0].sentences[1]],
      },
    ])
  })

  it("adds middle remaining words", () => {
    const titles = ["pantalones azul", "pantalones", "pantalones vaqueros azul"]

    const result = extractValues(titles)

    expect(result).toStrictEqual([
      {
        name: ["pantalones"],
        sentences: [expect.any(String), expect.any(String), expect.any(String)],
      },
      {
        name: ["azul"],
        sentences: [result[0].sentences[0], result[0].sentences[2]],
      },
      {
        name: ["vaqueros"],
        sentences: [result[0].sentences[2]],
      },
    ])
  })
})
