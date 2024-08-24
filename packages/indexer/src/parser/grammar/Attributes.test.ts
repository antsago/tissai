import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { Attributes } from "./index.js"

describe.skip("Attributes", () => {
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
        type: "attribute",
        labels: ["label"],
        value: tokens,
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
        type: "attribute",
        labels: ["label"],
        value: [tokens[0]],
      },
      tokens[1],
    ])
  })
})
