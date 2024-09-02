import { expect, describe, it } from "vitest"
import { Equals, Id, PropertyEnd, PropertyStart } from "../../lexer/symbols.js"
import { TokenReader } from "../../TokenReader.js"
import { DefinedProperty } from "./DefinedProperty.js"

describe("DefinedProperty", () => {
  it("handles data definitions", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "value",
      PropertyEnd,
    ])
    const result = await DefinedProperty({ key: "foo", name: "name" })(reader)
    expect(result).toStrictEqual({ key: "foo", value: ["value"] })
  })

  it("handles reference definitions", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      Id,
      "entity-id",
      PropertyEnd,
    ])
    const result = await DefinedProperty({
      key: "foo",
      name: "name",
      isReference: true,
    })(reader)
    expect(result).toStrictEqual({ key: "foo", value: [{ [Id]: "entity-id" }] })
  })

  it("handles parse definitions", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "A value",
      PropertyEnd,
    ])
    const result = await DefinedProperty({
      key: "foo",
      name: "name",
      parse: { as: "bar", with: (t) => t.split(" ") },
    })(reader)
    expect(result).toStrictEqual([
      { key: "foo", value: ["A value"] },
      { key: "bar", value: [["A", "value"]] },
    ])
  })
})
