import { expect, describe, it } from "vitest"
import { Product } from "./grammar.js"
import TokenReader from "./TokenReader.js"

describe("Product", () => {
  it("handles empty tokens", () => {
    const reader = new TokenReader([])

    const result = Product(reader)

    expect(result).toStrictEqual([])
  })

  it("recognizes top-level attributes", () => {
    const tokens = [{ labels: ["label"], isMeaningful: true, text: "token" }]
    const reader = new TokenReader(tokens)

    const result = Product(reader)

    expect(result).toStrictEqual([
      {
        type: "attribute",
        labels: ["label"],
        value: tokens,
      },
    ])
  })

  it("recognizes top-level filler", () => {
    const tokens = [{ labels: ["filler"], isMeaningful: false, text: "token" }]
    const reader = new TokenReader(tokens)

    const result = Product(reader)

    expect(result).toStrictEqual(tokens)
  })

  it("recognizes multiple segments", () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "token" },
    ]
    const reader = new TokenReader(tokens)

    const result = Product(reader)

    expect(result).toStrictEqual([
      {
        type: "attribute",
        labels: ["label"],
        value: [tokens[0]],
      },
      tokens[1],
    ])
  })
})
