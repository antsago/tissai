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
  const filler = { label: undefined, isMeaningful: false, text: "filler", ...TOKEN_BASE }
  const label = { label: "label", isMeaningful: true, text: "label", ...TOKEN_BASE }
  const getText = (tokens: WordToken[]) => tokens.map((t) => t.text).join(" ")

  it("rejects fillers", async () => {
    const reader = TokenReader([filler])

    const result = await Attribute(reader)

    expect(result).toStrictEqual(NonMatch)
  })

  it("matches labels", async () => {
    const reader = TokenReader([label])

    const result = await Attribute(reader)

    expect(result).toStrictEqual({ value: label.text, label: label.label })
  })

  it("matches consecutive labels", async () => {
    const reader = TokenReader([label, label])

    const result = await Attribute(reader)

    expect(result).toStrictEqual({ value: getText([label, label]), label: label.label })
  })

  it("matches multiple consecutive labels", async () => {
    const reader = TokenReader([label, label, label])

    const result = await Attribute(reader)

    expect(result).toStrictEqual({ value: getText([label, label, label]), label: label.label })
  })

  it("matches inner filler", async () => {
    const reader = TokenReader([label, filler, label])

    const result = await Attribute(reader)

    expect(result).toStrictEqual({ value: getText([label, filler, label]), label: label.label })
  })

  it("matches multiple inner filler", async () => {
    const reader = TokenReader([label, filler, filler, label])

    const result = await Attribute(reader)

    expect(result).toStrictEqual({ value: getText([label, filler, filler, label]), label: label.label })
  })

  it("rejects non-consecutive labels", async () => {
    const reader = TokenReader([label, filler, { ...label, label: "another label" }])

    const result = await Attribute(reader)

    expect(result).toStrictEqual({ value: label.text, label: label.label })
  })
})
