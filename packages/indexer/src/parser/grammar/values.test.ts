import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { NonMatch } from "../operators/nonMatch.js"
import { Any, IsSymbol } from "./values.js"

describe("values", () => {
  describe("Any", () => {
    it.each([true, false, "", "asdf", Symbol(), 123])("matches '%s'", (token) => {
      const result = Any(TokenReader([token]))
      expect(result).toStrictEqual(token)
    })
  })

  describe("IsSymbol", () => {
    it("matches given symbol", () => {
      const symbol = Symbol("foo")

      const result = IsSymbol(symbol)(TokenReader([symbol]))

      expect(result).toStrictEqual(symbol)
    })

    it("rejectes other symbols", () => {
      const symbol = Symbol("foo")

      const result = IsSymbol(Symbol())(TokenReader([symbol]))

      expect(result).toStrictEqual(NonMatch)
    })
  })
})
