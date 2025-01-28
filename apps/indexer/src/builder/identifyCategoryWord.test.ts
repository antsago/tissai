import { expect, describe, it } from "vitest"
import { identifyCategoryWord } from "./identifyCategoryWord"

describe("identifyCategoryWord", () => {
  it("throws if no category", async () => {
    const act = () => identifyCategoryWord("", ["word"])

    expect(act).toThrow()
  })

  it("throws if no words", async () => {
    const act = () => identifyCategoryWord("category", [])

    expect(act).toThrow()
  })

  it("returns the category word", async () => {
    const words = ["pantalones"]
    const result = identifyCategoryWord("Pantalón", words)

    expect(result).toStrictEqual(words[0])
  })

  it("returns closest word", async () => {
    const words = ["word", "category"]
    const result = identifyCategoryWord("category", words)

    expect(result).toStrictEqual(words[1])
  })

  it("throws if all words are too disimilar from category", async () => {
    const act = () => identifyCategoryWord("category", ["word"])

    expect(act).toThrow()
  })
})
