import { expect, describe, it } from "vitest"
import TokenReader from "./TokenReader.js"
import Label from "./Label.js"

describe("Label", () => {
  it("returns null if no next token", () => {
    const reader = new TokenReader([])

    const result = Label()(reader)

    expect(result).toBe(null)
  })

  it("returns null if the next token is not meaningful", () => {
    const TOKENS = [
      { labels: ["filler"], isMeaningful: false, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
    ]
    const reader = new TokenReader(TOKENS)

    const result = Label()(reader)

    expect(result).toBe(null)
    expect(reader.get()).toStrictEqual(TOKENS[0])
  })

  it("returns null if not meeting desired label", () => {
    const TOKENS = [
      { labels: ["label1", "label2"], isMeaningful: true, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
    ]
    const reader = new TokenReader(TOKENS)

    const result = Label(TOKENS[1].labels)(reader)

    expect(result).toBe(null)
    expect(reader.get()).toStrictEqual(TOKENS[0])
  })

  it("returns token if it's meaningful", () => {
    const TOKENS = [
      { labels: ["label1", "label2"], isMeaningful: true, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
    ]
    const reader = new TokenReader(TOKENS)

    const result = Label()(reader)

    expect(result).toStrictEqual(TOKENS[0])
    expect(reader.get()).toStrictEqual(TOKENS[1])
  })

  it("returns token if it includes one desired label", () => {
    const TOKENS = [
      { labels: ["label1", "label2"], isMeaningful: true, text: "a" },
      { labels: ["label"], isMeaningful: true, text: "token" },
    ]
    const reader = new TokenReader(TOKENS)

    const result = Label(["foo", TOKENS[0].labels[0]])(reader)

    expect(result).toStrictEqual(TOKENS[0])
    expect(reader.get()).toStrictEqual(TOKENS[1])
  })
})
