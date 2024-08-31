import { expect, describe, it } from "vitest"
import { TokenReader } from "../../TokenReader.js"
import { Attributes } from "./index.js"

describe("Attributes", () => {
  const TOKEN_BASE = {
    originalText: "foo",
    trailing: "",
  }
  it("handles empty tokens", async () => {
    const reader = TokenReader([])

    const result = await Attributes(reader)

    expect(result).toStrictEqual([])
  })

  it("recognizes top-level attributes", async () => {
    const tokens = [
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(tokens)

    const result = await Attributes(reader)

    expect(result).toStrictEqual([
      {
        label: "label",
        value: tokens[0].text,
      },
    ])
  })

  it("recognizes top-level filler", async () => {
    const tokens = [
      { label: undefined, isMeaningful: false, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(tokens)

    const result = await Attributes(reader)

    expect(result).toStrictEqual(tokens)
  })

  it("recognizes multiple segments", async () => {
    const tokens = [
      { label: "label", isMeaningful: true, text: "token", ...TOKEN_BASE },
      { label: undefined, isMeaningful: false, text: "token", ...TOKEN_BASE },
    ]
    const reader = TokenReader(tokens)

    const result = await Attributes(reader)

    expect(result).toStrictEqual([
      {
        label: "label",
        value: tokens[0].text,
      },
      tokens[1],
    ])
  })
})
