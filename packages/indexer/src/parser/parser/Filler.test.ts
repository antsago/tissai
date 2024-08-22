import { expect, describe, it } from "vitest"
import TokenReader from "../TokenReader.js"
import { Filler } from "./grammar.js"

describe("Filler", () => {
  it("returns null if no next token", () => {
    const reader = new TokenReader([])

    const result = Filler(reader)

    expect(result).toBe(null)
  })

  it("returns null if the next token is meaningful", () => {
    const TOKENS = [
      { labels: ["label1", "label2"], isMeaningful: true, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
    ]
    const reader = new TokenReader(TOKENS)

    const result = Filler(reader)

    expect(result).toBe(null)
    expect(reader.get()).toStrictEqual(TOKENS[0])
  })

  it("returns token if it's not meaningful", () => {
    const TOKENS = [
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
    ]
    const reader = new TokenReader(TOKENS)

    const result = Filler(reader)

    expect(result).toStrictEqual(TOKENS[0])
    expect(reader.get()).toStrictEqual(TOKENS[1])
  })
})
