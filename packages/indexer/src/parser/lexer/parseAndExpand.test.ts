import { expect, describe, it } from "vitest"
import { parseAndExpand } from "./parseAndExpand.js"

describe("parseAndExpand", () => {
  const PRESERVED_TYPES: [string, unknown][] = [
    ["strings", "a string"],
    ["numbers", 10],
    ["booleans", true],
    ["objects", {}],
  ]

  it("processes all tags", () => {
    const tags = [
      JSON.stringify({ "@type": "Product" }),
      JSON.stringify({ "@type": "BreadcrumbList" }),
    ]

    const result = parseAndExpand(tags)

    expect(result).toStrictEqual([
      { "@type": ["Product"] },
      { "@type": ["BreadcrumbList"] },
    ])
  })

  it("handles escaped quotes", () => {
    const tags = [
      JSON.stringify({
        description: "Nuestro modelo mide 6&amp;#39;2&quot;",
      }),
    ]

    const result = parseAndExpand(tags)

    expect(result).toStrictEqual([
      {
        description: ["Nuestro modelo mide 6'2\""],
      },
    ])
  })

  it("hoists @graph tags", () => {
    const tags = [
      JSON.stringify({
        "@graph": {
          "@type": "Product",
        },
      }),
    ]

    const result = parseAndExpand(tags)

    expect(result).toStrictEqual([{ "@type": ["Product"] }])
  })

  it("preserves empty objects", () => {
    const tags = [JSON.stringify({})]

    const result = parseAndExpand(tags)

    expect(result).toStrictEqual([{}])
  })

  it.each(PRESERVED_TYPES)("wraps array around %s", (name, value) => {
    const tags = [JSON.stringify({ foo: value })]

    const result = parseAndExpand(tags)

    expect(result).toStrictEqual([{ foo: [value] }])
  })

  it("removes properties with null values", () => {
    const tags = [JSON.stringify({ foo: null })]

    const result = parseAndExpand(tags)

    expect(result).toStrictEqual([{}])
  })

  it("recurses on object values", () => {
    const tags = [JSON.stringify({ foo: { bar: "a" } })]

    const result = parseAndExpand(tags)

    expect(result).toStrictEqual([{ foo: [{ bar: ["a"] }] }])
  })

  it("flattens nested array values", () => {
    const tags = [JSON.stringify({ foo: [["a"]] })]

    const result = parseAndExpand(tags)

    expect(result).toStrictEqual([{ foo: ["a"] }])
  })

  it.each(PRESERVED_TYPES)("preserves %s in arrays", (name, value) => {
    const tags = [JSON.stringify({ foo: [value] })]

    const result = parseAndExpand(tags)

    expect(result).toStrictEqual([{ foo: [value] }])
  })

  it("removes null array values", () => {
    const tags = [JSON.stringify({ foo: [null] })]

    const result = parseAndExpand(tags)

    expect(result).toStrictEqual([{ foo: [] }])
  })

  it("recurses on array values", () => {
    const tags = [JSON.stringify({ foo: [{ bar: "a" }] })]

    const result = parseAndExpand(tags)

    expect(result).toStrictEqual([{ foo: [{ bar: ["a"] }] }])
  })
})
