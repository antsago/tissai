import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { Context } from "../operators/index.js"
import { Label } from "./attributes.js"

describe("Label", () => {
  const TOKEN_BASE = {
    originalText: "foo",
    trailing: "",
  }

  it("returns null if no next token", () => {
    const reader = TokenReader([])
    const context = new Context()

    const result = Label(context)(reader)

    expect(result).toBe(null)
  })

  it("returns null if the next token is not meaningful", () => {
    const TOKENS = [
      { labels: ["filler"], isMeaningful: false, text: "a", ...TOKEN_BASE },
      { labels: ["label"], isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(TOKENS)
    const context = new Context()

    const result = Label(context)(reader)

    expect(result).toBe(null)
    expect(reader.get()).toStrictEqual(TOKENS[0])
  })

  it("returns null if not meeting desired label", () => {
    const TOKENS = [
      { labels: ["label1", "label2"], isMeaningful: true, text: "a", ...TOKEN_BASE },
      { labels: ["label"], isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(TOKENS)
    const context = new Context()
    context.narrow(TOKENS[1].labels)

    const result = Label(context)(reader)

    expect(result).toBe(null)
    expect(reader.get()).toStrictEqual(TOKENS[0])
  })

  it("returns token if it's meaningful", () => {
    const TOKENS = [
      { labels: ["label1", "label2"], isMeaningful: true, text: "a", ...TOKEN_BASE },
      { labels: ["label"], isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(TOKENS)
    const context = new Context()

    const result = Label(context)(reader)

    expect(result).toStrictEqual(TOKENS[0])
    expect(reader.get()).toStrictEqual(TOKENS[1])
  })

  it("returns token if it includes one desired label", () => {
    const TOKENS = [
      { labels: ["label1", "label2"], isMeaningful: true, text: "a", ...TOKEN_BASE },
      { labels: ["label"], isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(TOKENS)
    const context = new Context()
    context.narrow(["foo", TOKENS[0].labels[0]])

    const result = Label(context)(reader)

    expect(result).toStrictEqual(TOKENS[0])
    expect(reader.get()).toStrictEqual(TOKENS[1])
    expect(context.labels).toStrictEqual([TOKENS[0].labels[0]])
  })
})
