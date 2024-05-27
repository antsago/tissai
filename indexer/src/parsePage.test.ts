import { expect, describe, it } from "vitest"
import { PAGE, pageWithSchema } from "#mocks"
import parsePage from "./parsePage.js"

describe("parsePage", () => {
  describe("JSON-LD", () => {
    const PRESERVED_TYPES: [string, unknown][] = [
      ["strings", "a string"],
      ["numbers", 10],
      ["booleans", true],
      ["objects", {}],
    ]

    it("processes all tags", () => {
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

      const result = parsePage(page)

      expect(result).toStrictEqual(
        expect.objectContaining({
          jsonLd: [
            expect.objectContaining({ "@type": [productSchema["@type"]] }),
            expect.objectContaining({ "@type": [breadcrumbSchema["@type"]] }),
          ],
        }),
      )
    })

    it("preserves empty objects", () => {
      const page = pageWithSchema({})

      const result = parsePage(page)

      expect(result).toStrictEqual(
        expect.objectContaining({
          jsonLd: [{}],
        }),
      )
    })

    it.each(PRESERVED_TYPES)("wraps array around %s", (name, value) => {
      const page = pageWithSchema({ foo: value })

      const result = parsePage(page)

      expect(result).toStrictEqual(
        expect.objectContaining({
          jsonLd: [{ foo: [value] }],
        }),
      )
    })

    it("removes properties with null values", () => {
      const page = pageWithSchema({ foo: null })

      const result = parsePage(page)

      expect(result).toStrictEqual(
        expect.objectContaining({
          jsonLd: [{}],
        }),
      )
    })

    it("recurses on object values", () => {
      const page = pageWithSchema({ foo: { bar: "a" } })

      const result = parsePage(page)

      expect(result).toStrictEqual(
        expect.objectContaining({
          jsonLd: [{ foo: [{ bar: ["a"] }] }],
        }),
      )
    })

    it("flattens nested array values", () => {
      const page = pageWithSchema({ foo: [["a"]] })

      const result = parsePage(page)

      expect(result).toStrictEqual(
        expect.objectContaining({
          jsonLd: [{ foo: ["a"] }],
        }),
      )
    })

    it.each(PRESERVED_TYPES)("preserves %s in arrays", (name, value) => {
      const page = pageWithSchema({ foo: [value] })

      const result = parsePage(page)

      expect(result).toStrictEqual(
        expect.objectContaining({
          jsonLd: [{ foo: [value] }],
        }),
      )
    })

    it("removes null array values", () => {
      const page = pageWithSchema({ foo: [null] })

      const result = parsePage(page)

      expect(result).toStrictEqual(
        expect.objectContaining({
          jsonLd: [{ foo: [] }],
        }),
      )
    })

    it("recurses on array values", () => {
      const page = pageWithSchema({ foo: [{ bar: "a" }] })

      const result = parsePage(page)

      expect(result).toStrictEqual(
        expect.objectContaining({
          jsonLd: [{ foo: [{ bar: ["a"] }] }],
        }),
      )
    })
  })

  it("extracts heading information", () => {
    const headings = {
      title: "The page title",
      description: "The description",
      keywords: "Some, keywords",
      author: "The author",
      robots: "index,follow",
      canonical: PAGE.url,
    }
    const page = {
      ...PAGE,
      body: `
        <html>
          <head>
            <title>${headings.title}</title>
            <meta name="viewport" content="something else">
            <meta name="description" content="${headings.description}">
            <meta name="keywords" content="${headings.keywords}">
            <meta name="author" content="${headings.author}">
            <meta name="robots" content="${headings.robots}">
            <link rel="canonical" href="${headings.canonical}" />
          </head>
        </html>
      `,
    }

    const result = parsePage(page)

    expect(result).toStrictEqual(expect.objectContaining({ headings }))
  })

  it("extracts opengraph information", () => {
    const opengraph = {
      "og:type": "product",
      "og:title": "Friend Smash Coin",
      "og:image": "http://www.friendsmash.com/images/coin_600.png",
      "og:description": "Friend Smash Coins to purchase upgrades and items!",
      "og:url": "http://www.friendsmash.com/og/coins.html",
    }
    const page = {
      ...PAGE,
      body: `
        <html>
          <head>
            ${Object.entries(opengraph).map(([property, content]) => `<meta property="${property}" content="${content}" />`)}
          </head>
        </html>
      `,
    }

    const result = parsePage(page)

    expect(result).toStrictEqual(expect.objectContaining({ opengraph }))
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

    const result = parsePage(page)

    expect(result).toStrictEqual({
      jsonLd: [],
      opengraph: {},
      headings: {
        title: undefined,
        description: undefined,
        keywords: undefined,
        author: undefined,
        robots: undefined,
        canonical: undefined,
      },
    })
  })
})
