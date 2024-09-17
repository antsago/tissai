import { describe, it, expect } from "vitest"
import mergeTiles from "./mergeTiles"
import { ATTRIBUTE } from "@tissai/db/mocks"

describe("mergeTiles", () => {
  const SEARCH_RESULT = {
    id: "product-id",
    title: "Title",
    brand: null,
    price: null,
    image: null,
  }

  it("merges suggestions into products", async () => {
    const suggestions = [0.9, 0.7, 0.5, 0.3].map((frequency) => ({
      label: ATTRIBUTE.label,
      values: [ATTRIBUTE.value],
      frequency,
    }))
    const products = new Array(20).fill(undefined).map((_, i) => ({
      ...SEARCH_RESULT,
      id: String(i),
    }))

    const result = mergeTiles(products, suggestions)

    expect(result).toHaveLength(products.length + suggestions.length)
    expect(result).toStrictEqual(expect.arrayContaining(products))
    expect(result).toStrictEqual(expect.arrayContaining(suggestions))
    suggestions.forEach((suggestion, index) =>
      expect(result[(index + 1) * 4]).toStrictEqual(suggestion),
    )
  })

  it("ignores excess suggestions", async () => {
    const suggestions = [
      {
        label: ATTRIBUTE.label,
        values: [ATTRIBUTE.value],
        frequency: 1,
      },
    ]
    const products = [SEARCH_RESULT]

    const result = mergeTiles(products, suggestions)

    expect(result).toStrictEqual(products)
  })

  it.each([
    { frequency: 1, position: 4 },
    { frequency: 0.811, position: 4 },
    { frequency: 0.8, position: 3 },
    { frequency: 0.611, position: 3 },
    { frequency: 0.6, position: 2 },
    { frequency: 0.411, position: 2 },
    { frequency: 0.4, position: 1 },
    { frequency: 0.211, position: 1 },
    { frequency: 0.2, position: 0 },
    { frequency: 0.001, position: 0 },
  ])(
    "puts suggestions with frequency $frequency in index $position for every 4 products",
    ({ frequency, position }) => {
      const suggestion = {
        label: ATTRIBUTE.label,
        values: [ATTRIBUTE.value],
        frequency,
      }
      const products = new Array(4).fill(undefined).map((_, i) => ({
        ...SEARCH_RESULT,
        id: String(i),
        title: "Title",
      }))

      const result = mergeTiles(products, [suggestion])

      expect(result).toHaveLength(5)
      expect(result).toStrictEqual(expect.arrayContaining(products))
      expect(result[position]).toStrictEqual(suggestion)
    },
  )
})
