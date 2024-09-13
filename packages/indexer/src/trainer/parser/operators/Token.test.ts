import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { NonMatch } from "./nonMatch.js"
import { Token } from "./Token.js"

describe("Token", () => {
  it("rejects no next token", () => {
    const reader = TokenReader([])

    const result = Token(() => true)(reader)

    expect(result).toStrictEqual(NonMatch)
  })

  it("rejects tokens that fail the check", () => {
    const reader = TokenReader(["asdf"])

    const result = Token(() => false)(reader)

    expect(result).toStrictEqual(NonMatch)
    expect(reader.get()).toStrictEqual("asdf")
  })

  it("accepts tokens that the passed check", () => {
    const reader = TokenReader(["asdf"])

    const result = Token(() => true)(reader)

    expect(result).toStrictEqual("asdf")
    expect(reader.hasNext()).toBe(false)
  })
})
