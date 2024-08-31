import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { NonMatch } from "../operators/index.js"
import { Filler } from "./attributes.js"

describe("Filler", () => {
  const TOKEN_BASE = {
    originalText: "foo",
    trailing: "",
  }

  it("returns no match if no next token", () => {
    const reader = TokenReader([])

    const result = Filler(reader)

    expect(result).toBe(NonMatch)
  })

  it("returns no match if the next token is meaningful", () => {
    const TOKENS = [
      {
        labels: ["label1", "label2"],
        isMeaningful: true,
        text: "a",
        ...TOKEN_BASE,
      },
      { labels: ["label"], isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(TOKENS)

    const result = Filler(reader)

    expect(result).toBe(NonMatch)
    expect(reader.get()).toStrictEqual(TOKENS[0])
  })

  it("returns token if it's not meaningful", () => {
    const TOKENS = [
      { labels: ["filler"], isMeaningful: false, text: "a", ...TOKEN_BASE },
      { labels: ["label"], isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(TOKENS)

    const result = Filler(reader)

    expect(result).toStrictEqual(TOKENS[0])
    expect(reader.get()).toStrictEqual(TOKENS[1])
  })
})
