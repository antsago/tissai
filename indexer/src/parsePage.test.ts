import { expect, describe, it } from "vitest"
import { PAGE, pageWithSchema } from "#mocks"
import parsePage from "./parsePage.js"

describe("parsePage", () => {
  it("returns page url", async () => {
    const result = parsePage(PAGE)

    expect(result).toStrictEqual(expect.objectContaining({
      url: PAGE.url,
    }))
  })

  it("parses JSON-LD tags", async () => {
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

    expect(result).toStrictEqual(expect.objectContaining({
      jsonLd: [productSchema, breadcrumbSchema],
    }))
  })

  it("extracts heading information", async () => {
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

  it("extracts opengraph information", async () => {
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
})
