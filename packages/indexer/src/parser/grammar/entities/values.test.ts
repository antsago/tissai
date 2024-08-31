import { expect, describe, it } from "vitest"
import { Id, ValueSeparator } from "../../../lexer/symbols.js"
import { TokenReader } from "../../TokenReader.js"
import { NonMatch } from "../../operators/nonMatch.js"
import { Any, IsData, IsSymbol, IsValue } from "./values.js"

describe("values", () => {
  describe("Any", () => {
    it.each([true, false, "", "asdf", Symbol(), 123])("matches '%s'", (token) => {
      const reader = TokenReader([token])
      const result = Any(reader)
      expect(result).toStrictEqual(token)
    })
  })

  describe("IsValue", () => {
    it.each([true, false, "", "asdf", 123, Id, ValueSeparator])("matches '%s'", (token) => {
      const reader = TokenReader([token])
      const result = IsValue(reader)
      expect(result).toStrictEqual(token)
    })

    it("rejects non-value symbols", () => {
      const reader = TokenReader([Symbol()])
      const result = IsValue(reader)
      expect(result).toStrictEqual(NonMatch)
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

  describe("IsData", () => {
    it.each([true, false, "", "asdf", 123])("matches '%s'", (token) => {
      const reader = TokenReader([token])
      const result = IsData()(reader)
      expect(result).toStrictEqual(token)
    })

    it("rejectes symbols", () => {
      const reader = TokenReader([Symbol()])
      const result = IsData()(reader)
      expect(result).toStrictEqual(NonMatch)
    })

    it("matches expected data", () => {
      const reader = TokenReader(["expected"])
      const result = IsData("expected")(reader)
      expect(result).toStrictEqual("expected")
    })

    it("rejects unexpected data", () => {
      const reader = TokenReader(["unexpected"])
      const result = IsData("expected")(reader)
      expect(result).toStrictEqual(NonMatch)
    })
  })
})
