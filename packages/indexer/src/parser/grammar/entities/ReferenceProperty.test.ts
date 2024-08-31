import { expect, describe, it } from "vitest"
import {
  Equals,
  Id,
  PropertyEnd,
  PropertyStart,
} from "../../../lexer/symbols.js"
import { TokenReader } from "../../TokenReader.js"
import { NonMatch } from "../../operators/nonMatch.js"
import { ReferenceProperty } from "./properties.js"

describe("ReferenceProperty", () => {
  it("matches definition", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      Id,
      "entity-id",
      PropertyEnd,
    ])
    const result = await ReferenceProperty({ key: "foo", name: "name", isReference: true })(reader)
    expect(result).toStrictEqual({ key: "foo", value: [{ [Id]: "entity-id"}] })
  })

  it("requires specified name", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      Id,
      "entity-id",
      PropertyEnd,
    ])
    const result = await ReferenceProperty({ key: "foo", name: "bar", isReference: true })(reader)
    expect(result).toStrictEqual(NonMatch)
  })

  it("requires id symbol", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "entity-id",
      PropertyEnd,
    ])
    const result = await ReferenceProperty({ key: "foo", name: "name", isReference: true })(reader)
    expect(result).toStrictEqual(NonMatch)
  })
})
