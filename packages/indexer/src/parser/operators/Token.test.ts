import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { NonMatch } from "./nonMatch.js"
import { Token } from "./Token.js"

describe("Token", () => {
  it("rejects no next token", () => {
    const tokens = []

    const result = Token(() => true)(TokenReader(tokens))

    expect(result).toStrictEqual(NonMatch)
  })

  it("rejects tokens that fail the check", () => {
    const tokens = ["asdf"]

    const result = Token(() => false)(TokenReader(tokens))

    expect(result).toStrictEqual(NonMatch)
  })

  it("accepts tokens that the passed check", () => {
    const tokens = ["asdf"]

    const result = Token(() => true)(TokenReader(tokens))

    expect(result).toStrictEqual(tokens[0])
  })
})
