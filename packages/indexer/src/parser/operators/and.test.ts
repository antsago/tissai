import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { Token } from "./Token.js"
import { NonMatch } from "./nonMatch.js"
import and from "./and.js"

describe("and", () => {
  const IsYes = Token((t) => t === "yes")
  const IsNo = Token((t) => t === "no")

  it("requires first match", async () => {
    const reader = TokenReader(["yes", "no"])

    const result = await and(IsNo)(reader)

    expect(result).toStrictEqual(NonMatch)
    expect(reader.get()).toBe("yes")
  })

  it("requires subsequent rules", async () => {
    const reader = TokenReader(["yes", "no"])

    const result = await and(IsYes, IsYes)(reader)

    expect(result).toStrictEqual(NonMatch)
    expect(reader.get()).toBe("yes")
  })

  it("accepts all matches", async () => {
    const reader = TokenReader(["yes", "no"])

    const result = await and(IsYes, IsNo)(reader)

    expect(result).toStrictEqual(["yes", "no"])
    expect(reader.hasNext()).toBe(false)
  })
})
