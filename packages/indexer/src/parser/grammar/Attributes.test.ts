import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { Attributes } from "./attributes.js"

describe("Attributes", () => {
  it("handles empty tokens", async () => {
    const reader = TokenReader([])

    const result = await Attributes(reader)

    expect(result).toStrictEqual([])
  })

  it("recognizes top-level attributes", async () => {
    const tokens = [{ labels: ["label"], isMeaningful: true, text: "token" }]
    const reader = TokenReader(tokens)

    const result = await Attributes(reader)

    expect(result).toStrictEqual([
      {
        labels: ["label"],
        value: tokens[0].text,
      },
    ])
  })

  it("recognizes top-level filler", async () => {
    const tokens = [{ labels: ["filler"], isMeaningful: false, text: "token" }]
    const reader = TokenReader(tokens)

    const result = await Attributes(reader)

    expect(result).toStrictEqual(tokens)
  })

  it("recognizes multiple segments", async () => {
    const tokens = [
      { labels: ["label"], isMeaningful: true, text: "token" },
      { labels: ["filler"], isMeaningful: false, text: "token" },
    ]
    const reader = TokenReader(tokens)

    const result = await Attributes(reader)

    expect(result).toStrictEqual([
      {
        labels: ["label"],
        value: tokens[0].text,
      },
      tokens[1],
    ])
  })
})
