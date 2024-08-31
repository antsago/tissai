import { expect, describe, it } from "vitest"
import {
  Equals,
  Id,
  PropertyEnd,
  PropertyStart,
} from "../../../lexer/symbols.js"
import { TokenReader } from "../../TokenReader.js"
import { NonMatch } from "../../operators/nonMatch.js"
import { ParsedProperty } from "./properties.js"

describe("ParsedProperty", () => {
  const DEFINITION = {
    key: "foo",
    name: "name",
    parse: { as: "bar", with: (t: string) => t.split(" ") },
  }
  it("parses matched value", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "A value",
      PropertyEnd,
    ])
    const result = await ParsedProperty(DEFINITION)(reader)
    expect(result).toStrictEqual([
      { key: "foo", value: ["A value"] },
      { key: "bar", value: [["A", "value"]] },
    ])
  })

  it("requires specified name", async () => {
    const reader = TokenReader([
      PropertyStart,
      "bar",
      Equals,
      "A value",
      PropertyEnd,
    ])
    const result = await ParsedProperty(DEFINITION)(reader)
    expect(result).toStrictEqual(NonMatch)
  })
})
