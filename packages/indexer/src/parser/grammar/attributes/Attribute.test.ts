import { expect, describe, it } from "vitest"
import type { WordToken } from "../../types.js"
import { TokenReader } from "../../TokenReader.js"
import { NonMatch } from "../../operators/index.js"
import { Attribute } from "./index.js"

describe("Attribute", () => {
  const TOKEN_BASE = {
    originalText: "foo",
    trailing: "",
  }
  const getText = (tokens: WordToken[]) => tokens.map((t) => t.text).join(" ")

  it("returns no match if no next token", async () => {
    const reader = TokenReader([])

    const result = await Attribute(reader)

    expect(result).toBe(NonMatch)
  })

  it("rejects starting fillers", async () => {
    const tokens = [
      { label: undefined, isMeaningful: false, text: "a", ...TOKEN_BASE },
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toBe(NonMatch)
    expect(reader.get()).toStrictEqual(tokens[0])
  })

  it("recognizes single label", async () => {
    const tokens = [
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
      { label: undefined, isMeaningful: false, text: "a", ...TOKEN_BASE },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      label: tokens[0].label,
      value: getText(tokens.slice(0, 1)),
    })
    expect(reader.get()).toStrictEqual(tokens[1])
  })

  it("recognizes consecutive labels", async () => {
    const tokens = [
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
      { label: undefined, isMeaningful: false, text: "a", ...TOKEN_BASE },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      label: tokens[0].label,
      value: getText(tokens.slice(0, 2)),
    })
    expect(reader.get()).toStrictEqual(tokens[2])
  })

  it("accepts inbetween filler", async () => {
    const tokens = [
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
      { label: undefined, isMeaningful: false, text: "a", ...TOKEN_BASE },
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
      { label: undefined, isMeaningful: false, text: "a", ...TOKEN_BASE },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      label: tokens[0].label,
      value: getText(tokens.slice(0, 3)),
    })
    expect(reader.get()).toStrictEqual(tokens[3])
  })

  it("accepts multiple infiller", async () => {
    const tokens = [
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
      { label: undefined, isMeaningful: false, text: "a", ...TOKEN_BASE },
      { label: undefined, isMeaningful: false, text: "a", ...TOKEN_BASE },
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
      { label: undefined, isMeaningful: false, text: "a", ...TOKEN_BASE },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      label: tokens[0].label,
      value: getText(tokens.slice(0, 4)),
    })
    expect(reader.get()).toStrictEqual(tokens[4])
  })

  it("does not append different labels", async () => {
    const tokens = [
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
      { label: undefined, isMeaningful: false, text: "a", ...TOKEN_BASE },
      {
        label: "other label",
        isMeaningful: true,
        text: "token",
        ...TOKEN_BASE,
      },
      { label: undefined, isMeaningful: false, text: "a", ...TOKEN_BASE },
    ]
    const reader = TokenReader(tokens)

    const result = await Attribute(reader)

    expect(result).toStrictEqual({
      label: tokens[0].label,
      value: tokens[0].text,
    })
    expect(reader.get()).toStrictEqual(tokens[1])
  })
})
