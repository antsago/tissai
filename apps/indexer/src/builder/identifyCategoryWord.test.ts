import { expect, describe, it } from "vitest"
import { identifyCategoryWord } from "./identifyCategoryWord"

describe("identifyCategoryWord", () => {
  it("returns empty if no category", async () => {
    const result = identifyCategoryWord("", ["word"])

    expect(result).toStrictEqual("")
  })

  it("returns empty if no words", async () => {
    const result = identifyCategoryWord("category", [])

    expect(result).toStrictEqual("")
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

  it("returns empty if all words are too disimilar from category", async () => {
    const result = identifyCategoryWord("category", ["word"])

    expect(result).toStrictEqual("")
  })
})
