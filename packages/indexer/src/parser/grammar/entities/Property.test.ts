import { expect, describe, it } from "vitest"
import {
  Equals,
  Id,
  PropertyEnd,
  PropertyStart,
  ValueSeparator,
} from "../../lexer/symbols.js"
import { TokenReader } from "../../TokenReader.js"
import { NonMatch } from "../../operators/nonMatch.js"
import { IsData } from "./values.js"
import { Property } from "./Property.js"

describe("Property", () => {
  it("matches properties", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "value",
      PropertyEnd,
    ])
    const result = await Property(IsData())(reader)
    expect(result).toStrictEqual(["value"])
  })

  it("requires start symbol", async () => {
    const reader = TokenReader(["name", Equals, "value", PropertyEnd])
    const result = await Property(IsData())(reader)
    expect(result).toStrictEqual(NonMatch)
  })

  it("requires property name", async () => {
    const reader = TokenReader([PropertyStart, Equals, "value", PropertyEnd])
    const result = await Property(IsData())(reader)
    expect(result).toStrictEqual(NonMatch)
  })

  it("requires equals symbol", async () => {
    const reader = TokenReader([PropertyStart, "name", "value", PropertyEnd])
    const result = await Property(IsData())(reader)
    expect(result).toStrictEqual(NonMatch)
  })

  it("requires value", async () => {
    const reader = TokenReader([PropertyStart, "name", Equals, PropertyEnd])
    const result = await Property(IsData())(reader)
    expect(result).toStrictEqual(NonMatch)
  })

  it("requires end symbol", async () => {
    const reader = TokenReader([PropertyStart, "name", Equals, "value"])
    const result = await Property(IsData())(reader)
    expect(result).toStrictEqual(NonMatch)
  })

  it("matches multiple values", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "value",
      ValueSeparator,
      "value2",
      PropertyEnd,
    ])
    const result = await Property(IsData(), "name")(reader)
    expect(result).toStrictEqual(["value", "value2"])
  })

  it("requires value separator", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "value",
      "value2",
      PropertyEnd,
    ])
    const result = await Property(IsData(), "name")(reader)
    expect(result).toStrictEqual(NonMatch)
  })

  it("matches specified name", async () => {
    const reader = TokenReader([
      PropertyStart,
      "name",
      Equals,
      "value",
      PropertyEnd,
    ])
    const result = await Property(IsData(), "name")(reader)
    expect(result).toStrictEqual(["value"])
  })

  it("requires specified name", async () => {
    const reader = TokenReader([
      PropertyStart,
      "foo",
      Equals,
      "value",
      PropertyEnd,
    ])
    const result = await Property(IsData(), "name")(reader)
    expect(result).toStrictEqual(NonMatch)
  })
})
