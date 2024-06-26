import { expect, describe, it } from "vitest"
import { PAGE, pageWithSchema } from "#mocks"
import parsedPage from "./parsedPage"
import jsonLd from "./jsonLd"

  describe("jsonLd", () => {
    const PRESERVED_TYPES: [string, unknown][] = [
      ["strings", "a string"],
      ["numbers", 10],
      ["booleans", true],
      ["objects", {}],
    ]
    const productSchema = {
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
    }

    it("processes all tags", () => {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Menpants",
            item: "https://es.shein.com/category/Menpants-sc-008113048.html",
          },
        ],
      }
      const page = pageWithSchema(productSchema, breadcrumbSchema)

      const result = jsonLd(parsedPage(page))

      expect(result).toStrictEqual(
        expect.objectContaining([
            expect.objectContaining({ "@type": [productSchema["@type"]] }),
            expect.objectContaining({ "@type": [breadcrumbSchema["@type"]] }),
          ]),
      )
    })

    it("handles escaped quotes", () => {
      const page = pageWithSchema({
        "@context": "https://schema.org",
        description: "Nuestro modelo mide 6&amp;#39;2&quot;",
      })

      const result = jsonLd(parsedPage(page))

      expect(result).toStrictEqual(
        expect.objectContaining([
            expect.objectContaining({
              description: ["Nuestro modelo mide 6'2\""],
            }),
          ]),
      )
    })

    it("hoists @graph tags", () => {
      const page = pageWithSchema({
        "@context": "https://schema.org",
        "@graph": [productSchema],
      })

      const result = jsonLd(parsedPage(page))

      expect(result).toStrictEqual(
        expect.objectContaining([
            expect.objectContaining({ "@type": [productSchema["@type"]] }),
          ]),
      )
    })

    it("preserves empty objects", () => {
      const page = pageWithSchema({})

      const result = jsonLd(parsedPage(page))

      expect(result).toStrictEqual(
        expect.objectContaining([{}]),
      )
    })

    it.each(PRESERVED_TYPES)("wraps array around %s", (name, value) => {
      const page = pageWithSchema({ foo: value })

      const result = jsonLd(parsedPage(page))

      expect(result).toStrictEqual(
        expect.objectContaining([{ foo: [value] }]),
      )
    })

    it("removes properties with null values", () => {
      const page = pageWithSchema({ foo: null })

      const result = jsonLd(parsedPage(page))

      expect(result).toStrictEqual(
        expect.objectContaining([{}]),
      )
    })

    it("recurses on object values", () => {
      const page = pageWithSchema({ foo: { bar: "a" } })

      const result = jsonLd(parsedPage(page))

      expect(result).toStrictEqual([{ foo: [{ bar: ["a"] }] }])
    })

    it("flattens nested array values", () => {
      const page = pageWithSchema({ foo: [["a"]] })

      const result = jsonLd(parsedPage(page))

      expect(result).toStrictEqual(
        expect.objectContaining([{ foo: ["a"] }]),
      )
    })

    it.each(PRESERVED_TYPES)("preserves %s in arrays", (name, value) => {
      const page = pageWithSchema({ foo: [value] })

      const result = jsonLd(parsedPage(page))

      expect(result).toStrictEqual(
        expect.objectContaining([{ foo: [value] }]),
      )
    })

    it("removes null array values", () => {
      const page = pageWithSchema({ foo: [null] })

      const result = jsonLd(parsedPage(page))

      expect(result).toStrictEqual(
        expect.objectContaining([{ foo: [] }]),
      )
    })

    it("recurses on array values", () => {
      const page = pageWithSchema({ foo: [{ bar: "a" }] })

      const result = jsonLd(parsedPage(page))

      expect(result).toStrictEqual(
        expect.objectContaining([{ foo: [{ bar: ["a"] }] }]),
      )
    })

  it("handles empty pages", () => {
    const page = {
      ...PAGE,
      body: `
        <html>
          <head>
          </head>
        </html>
      `,
    }

    const result = jsonLd(parsedPage(page))

    expect(result).toStrictEqual([])
  })
})
