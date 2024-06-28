import { expect, describe, it } from "vitest"
import { PAGE, pageWithSchema } from "#mocks"
import parsedPage from "./parsedPage"
import jsonLd, { parseAndExpand } from "./jsonLd"

describe("jsonLd", () => {
  const PRODUCT_SCHEMA = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: "The name of the product",
    productID: "121230",
    brand: {
      "@type": "Brand",
      name: "WEDZE",
      image: ["https://brand.com/image.jpg"],
    },
    description: "The description",
    image: "https://example.com/image.jpg",
    offers: [
      {
        "@type": "Offer",
        url: "https://example.com/offer",
        price: 10,
        priceCurrency: "EUR",
        seller: {
          "@type": "Organization",
          name: "pertemba",
        },
      },
    ],
  }

  describe("expand", () => {
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

  it("extracts relevant info", () => {
    const page = pageWithSchema(PRODUCT_SCHEMA)

    const result = jsonLd(parsedPage(page))

    expect(result).toStrictEqual({
      title: PRODUCT_SCHEMA.name,
      description: PRODUCT_SCHEMA.description,
      image: [PRODUCT_SCHEMA.image],
      brandName: PRODUCT_SCHEMA.brand.name,
      brandLogo: PRODUCT_SCHEMA.brand.image[0],
      offers: [
        {
          price: PRODUCT_SCHEMA.offers[0].price,
          currency: PRODUCT_SCHEMA.offers[0].priceCurrency,
          seller: PRODUCT_SCHEMA.offers[0].seller.name,
        },
      ],
    })
  })

  it("ignores non-product tags", () => {
    const page = pageWithSchema({
      ...PRODUCT_SCHEMA,
      "@type": "Other",
    })

    const result = jsonLd(parsedPage(page))

    expect(result).toStrictEqual({
      title: undefined,
      description: undefined,
      image: undefined,
      brandName: undefined,
      brandLogo: undefined,
      offers: undefined,
    })
  })

  it("handles empty pages", () => {
    const page = pageWithSchema()

    const result = jsonLd(parsedPage(page))

    expect(result).toStrictEqual({
      title: undefined,
      description: undefined,
      image: undefined,
      brandName: undefined,
      brandLogo: undefined,
      offers: undefined,
    })
  })
})
