import { expect, describe, it } from "vitest"
import { TokenReader } from "../../TokenReader.js"
import { Attributes } from "./index.js"

describe("Attributes", () => {
  const TOKEN_BASE = {
    originalText: "foo",
    trailing: "",
  }
  const filler = { label: undefined, isMeaningful: false, text: "filler", ...TOKEN_BASE }
  const attribute = { label: "label", isMeaningful: true, text: "label", ...TOKEN_BASE }

  it("matches attributes", async () => {
    const reader = TokenReader([attribute])

    const result = await Attributes(reader)

    expect(result).toStrictEqual([
      {
        label: attribute.label,
        value: attribute.text,
      },
    ])
  })

  it("matches filler", async () => {
    const reader = TokenReader([filler])

    const result = await Attributes(reader)

    expect(result).toStrictEqual([
      filler,
    ])
  })

  it("matches attributes and filler", async () => {
    const reader = TokenReader([attribute, filler])

    const result = await Attributes(reader)

    expect(result).toStrictEqual([
      {
        label: attribute.label,
        value: attribute.text,
      },
      filler,
    ])
  })
})
