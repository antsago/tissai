import { expect, describe, it } from "vitest"
import parser from './parser.js'

describe("parser", () => {
  it("handles empty tokens", () => {
    const result = parser([])

    expect(result).toStrictEqual([])
  })

  it("recognizes top-level attributes", () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
    ]

    const result = parser(tokens)

    expect(result).toStrictEqual([{
      type: "attribute",
      labels: ["label"],
      value: tokens,
    }])
  })

  it("recognizes top-level filler", () => {
    const tokens = [
      { labels: ["filler"], isMeaningful: false, text: "token" },
    ]

    const result = parser(tokens)

    expect(result).toStrictEqual(tokens)
  })

  it("recognizes multiple segments", () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "token" },
    ]

    const result = parser(tokens)

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
