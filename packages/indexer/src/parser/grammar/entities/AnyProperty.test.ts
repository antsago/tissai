import { expect, describe, it } from "vitest"
import { Equals, PropertyEnd, PropertyStart } from "../../../lexer/symbols.js"
import { TokenReader } from "../../TokenReader.js"
import { AnyProperty } from "./properties.js"

describe("AnyProperty", () => {
  it("matches properties", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "value",
      PropertyEnd,
    ])
    const result = await AnyProperty(reader)
    expect(result).toStrictEqual({ key: undefined, value: ["value"] })
  })

  it("matches multi-symbol properties", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "value",
      "value",
      PropertyEnd,
    ])
    const result = await AnyProperty(reader)
    expect(result).toStrictEqual({ key: undefined, value: ["value", "value"] })
  })
})
