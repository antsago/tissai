import { describe, it, expect } from "vitest"
import mergeTiles from "./mergeTiles"
import { SUGGESTION } from "mocks"

describe("mergeTiles", () => {
  const SEARCH_RESULT = {
    id: "product-id",
    title: "Title",
    brand: null,
    price: null,
    image: null,
  }

  it("merges suggestion into products", async () => {
    const products = new Array(20).fill(undefined).map((_, i) => ({
      ...SEARCH_RESULT,
      id: String(i),
    }))

    const result = mergeTiles(products, [SUGGESTION])

    expect(result).toHaveLength(products.length + 1)
    expect(result[0]).toStrictEqual(SUGGESTION)
    expect(result).toStrictEqual(expect.arrayContaining(products))
  })

  it("interpolates multiple suggestions", async () => {
    const suggestions = new Array(5).fill(undefined).map((_, i) => ({
      label: `${SUGGESTION.label}_${i}`,
      values: SUGGESTION.values,
    }))
    const products = new Array(20).fill(undefined).map((_, i) => ({
      ...SEARCH_RESULT,
      id: String(i),
    }))

    const result = mergeTiles(products, suggestions)

    expect(result).toHaveLength(products.length + suggestions.length)
    expect(result).toStrictEqual(expect.arrayContaining(products))
    expect(result[0]).toStrictEqual(suggestions[0])
    expect(result[5]).toStrictEqual(suggestions[1])
    expect(result[10]).toStrictEqual(suggestions[2])
    expect(result[15]).toStrictEqual(suggestions[3])
    expect(result[20]).toStrictEqual(suggestions[4])
  })

  it("ignores excess suggestions", async () => {
    const suggestions = new Array(5).fill(undefined).map((_, i) => ({
      label: `${SUGGESTION.label}_${i}`,
      values: SUGGESTION.values,
    }))
    const products = [SEARCH_RESULT]

    const result = mergeTiles(products, suggestions)

    expect(result).toStrictEqual([suggestions[0], SEARCH_RESULT])
  })
})
