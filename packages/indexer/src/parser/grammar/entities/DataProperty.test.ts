import { expect, describe, it } from "vitest"
import { Equals, PropertyEnd, PropertyStart } from "../../../lexer/symbols.js"
import { TokenReader } from "../../TokenReader.js"
import { NonMatch } from "../../operators/nonMatch.js"
import { DataProperty } from "./properties.js"

describe("DataProperty", () => {
  it("matches definition", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "value",
      PropertyEnd,
    ])
    const result = await DataProperty({ key: "foo", name: "name" })(reader)
    expect(result).toStrictEqual({ key: "foo", value: ["value"] })
  })

  it("matches specified value", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "value",
      PropertyEnd,
    ])
    const result = await DataProperty({
      key: "foo",
      name: "name",
      value: "value",
    })(reader)
    expect(result).toStrictEqual({ key: "foo", value: ["value"] })
  })

  it("requires specified name", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "value",
      PropertyEnd,
    ])
    const result = await DataProperty({ key: "foo", name: "bar" })(reader)
    expect(result).toStrictEqual(NonMatch)
  })

  it("requires specified value", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "value",
      PropertyEnd,
    ])
    const result = await DataProperty({
      key: "foo",
      name: "name",
      value: "bar",
    })(reader)
    expect(result).toStrictEqual(NonMatch)
  })
})
