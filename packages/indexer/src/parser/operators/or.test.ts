import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { Token } from "./Token.js"
import { NonMatch } from "./nonMatch.js"
import or from "./or.js"

describe("or", () => {
  const IsYes = Token(t => t === "yes")
  const IsNo = Token(t => t === "no")

  it("matches first rule", async () => {
    const reader = TokenReader(["yes"])

    const result = await or(IsYes)(reader)

    expect(result).toStrictEqual("yes")
    expect(reader.hasNext()).toBe(false)
  })

  it("matches subsequent rules", async () => {
    const reader = TokenReader(["yes"])

    const result = await or(IsNo, IsYes)(reader)

    expect(result).toStrictEqual("yes")
    expect(reader.hasNext()).toBe(false)
  })

  it("rejects no matches", async () => {
    const reader = TokenReader(["maybe?"])

    const result = await or(IsYes, IsNo)(reader)

    expect(result).toStrictEqual(NonMatch)
    expect(reader.hasNext()).toBe(true)
  })
})
