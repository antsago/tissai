import { expect, describe, it } from "vitest"
import { pageWithSchema } from "#mocks"
import { parsePage } from "./parsePage.js"

describe("parsePage", () => {
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

  it("extracts relevant info", () => {
    const page = pageWithSchema(PRODUCT_SCHEMA)

    const result = parsePage(page.body)

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

    const result = parsePage(page.body)

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

    const result = parsePage(page.body)

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
