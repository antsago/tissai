import { expect, describe, it } from "vitest"
import { pageWithSchema } from "#mocks"
import parsePage from "./parsePage.js"

describe("parsePage", () => {
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
      jsonLd: [productSchema, breadcrumbSchema]
    }))
  })
})
