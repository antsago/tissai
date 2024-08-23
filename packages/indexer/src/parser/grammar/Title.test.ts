import { expect, describe, it } from "vitest"
import TokenReader from "../TokenReader.js"
import { Title } from "./index.js"

describe("Title", () => {
  it("handles empty tokens", () => {
    const reader = new TokenReader([])

    const result = Title(reader)

    expect(result).toStrictEqual([])
  })

  it("recognizes top-level attributes", () => {
    const tokens = [{ labels: ["label"], isMeaningful: true, text: "token" }]
    const reader = new TokenReader(tokens)

    const result = Title(reader)

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

    const result = Title(reader)

    expect(result).toStrictEqual(tokens)
  })

  it("recognizes multiple segments", () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "token" },
    ]
    const reader = new TokenReader(tokens)

    const result = Title(reader)

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
