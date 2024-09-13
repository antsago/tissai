import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { Token } from "./Token.js"
import { NonMatch } from "./nonMatch.js"
import { given } from "./given.js"

describe("given", () => {
  const IsYes = Token((t: string) => t === "yes")
  const IsNo = Token((t: string) => t === "no")

  it("returns onMatch if condition and assertion match", async () => {
    const reader = TokenReader(["yes"])

    const result = await given(IsYes, () => true, IsYes)(reader)

    expect(result).toStrictEqual("yes")
    expect(reader.hasNext()).toBe(false)
  })

  it("rejects if condition does not match", async () => {
    const reader = TokenReader(["yes"])

    const result = await given(IsNo, () => true, IsYes)(reader)

    expect(result).toStrictEqual(NonMatch)
    expect(reader.hasNext()).toBe(true)
  })

  it("rejects if assertion does not match", async () => {
    const reader = TokenReader(["yes"])

    const result = await given(IsYes, () => false, IsYes)(reader)

    expect(result).toStrictEqual(NonMatch)
    expect(reader.hasNext()).toBe(true)
  })
})
