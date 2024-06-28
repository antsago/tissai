import { expect, describe, test, beforeEach } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { DERIVED_DATA, PAGE } from "#mocks"
import { EntityExtractor } from "./EntityExtractor.js"

type Fixtures = {
  mockPython: mockPythonFixture
}

const it = test.extend<Fixtures>({
  mockPython: [mockPythonFixture, { auto: true }],
})

const jsonLd = {
  "@context": ["https://schema.org/"],
  "@type": ["Product"],
  name: ["The name of the product"],
  productID: ["121230"],
  brand: [
    {
      "@type": ["Brand"],
      name: ["wedze"],
      image: ["https://brand.com/image.jpg"],
    },
  ],
  description: ["The description"],
  image: ["https://example.com/image.jpg"],
  offers: [
    {
      "@type": ["Offer"],
      url: ["https://example.com/offer"],
      price: [10],
      priceCurrency: ["EUR"],
      seller: [
        {
          "@type": ["Organization"],
          name: ["pertemba"],
        },
      ],
    },
  ],
}
const opengraph = {
  "og:type": "product",
  "og:title": "Friend Smash Coin",
  "og:image": "http://www.friendsmash.com/images/coin_600.png",
  "og:description": "Friend Smash Coins to purchase upgrades and items!",
  "og:url": "http://www.friendsmash.com/og/coins.html",
}
const headings = {
  title: "The page title",
  description: "The description",
  keywords: "Some, keywords",
  author: "The author",
  robots: "index,follow",
  canonical: PAGE.url,
}

describe("EntityExtractor", () => {
  let extractor: EntityExtractor
  beforeEach<Fixtures>(async ({ mockPython }) => {
    extractor = EntityExtractor()
    mockPython.mockReturnValue(DERIVED_DATA)
  })

  it("closes python on close", async ({ mockPython }) => {
    await extractor.close()

    expect(mockPython.worker.end).toHaveBeenCalled()
  })

  it("handles empty pages", async ({ mockPython }) => {
    const act = extractor.extract(
      { jsonLd: [], opengraph: {}, headings: {} },
      PAGE,
    )

    await expect(act).rejects.toThrow("Product without title")
    expect(mockPython.worker.send).not.toHaveBeenCalled()
  })

  describe("products", () => {
    it("extracts product", async () => {
      const { product } = await extractor.extract(
        { jsonLd: [jsonLd], opengraph, headings },
        PAGE,
      )

      expect(product).toStrictEqual({
        id: expect.any(String),
        title: jsonLd.name[0],
        images: jsonLd.image,
        description: jsonLd.description[0],
        brand: jsonLd.brand[0].name[0],
        category: DERIVED_DATA.category,
        tags: DERIVED_DATA.tags,
        embedding: DERIVED_DATA.embedding,
      })
    })

    it("handles title-only product", async () => {
      const { product } = await extractor.extract(
        {
          jsonLd: [
            {
              "@context": jsonLd["@context"],
              "@type": jsonLd["@type"],
              name: jsonLd["name"],
            },
          ],
          opengraph: {},
          headings: {},
        },
        PAGE,
      )

      expect(product).toStrictEqual({
        id: expect.any(String),
        title: jsonLd.name[0],
        images: undefined,
        description: undefined,
        brand: undefined,
        category: DERIVED_DATA.category,
        tags: DERIVED_DATA.tags,
        embedding: DERIVED_DATA.embedding,
      })
    })

    it("defaults to opengraph", async () => {
      const { product } = await extractor.extract(
        { jsonLd: [], opengraph, headings },
        PAGE,
      )

      expect(product).toStrictEqual({
        id: expect.any(String),
        title: opengraph["og:title"],
        images: [opengraph["og:image"]],
        description: opengraph["og:description"],
        brand: undefined,
        category: DERIVED_DATA.category,
        tags: DERIVED_DATA.tags,
        embedding: DERIVED_DATA.embedding,
      })
    })

    it("defaults to headings", async () => {
      const { product } = await extractor.extract(
        { jsonLd: [], opengraph: {}, headings },
        PAGE,
      )

      expect(product).toStrictEqual({
        id: expect.any(String),
        title: headings.title,
        images: undefined,
        description: headings.description,
        brand: undefined,
        category: DERIVED_DATA.category,
        tags: DERIVED_DATA.tags,
        embedding: DERIVED_DATA.embedding,
      })
    })

    it("ignores non-product opengraph", async () => {
      const { product } = await extractor.extract(
        { jsonLd: [], opengraph: { ...opengraph, "og:type": "foo" }, headings },
        PAGE,
      )

      expect(product).toStrictEqual(
        expect.objectContaining({
          title: headings.title,
        }),
      )
    })
  })

  describe("offers", () => {
    it("extracts offer", async () => {
      const { offers, product } = await extractor.extract(
        { jsonLd: [jsonLd], opengraph: {}, headings: {} },
        PAGE,
      )

      expect(offers).toStrictEqual([
        {
          id: expect.any(String),
          url: PAGE.url,
          site: PAGE.site,
          product: product.id,
          price: jsonLd.offers[0].price[0],
          currency: jsonLd.offers[0].priceCurrency[0],
          seller: jsonLd.offers[0].seller[0].name[0],
        },
      ])
    })

    it("extracts implicit offer", async () => {
      const { offers, product } = await extractor.extract(
        {
          jsonLd: [
            {
              "@context": jsonLd["@context"],
              "@type": jsonLd["@type"],
              name: jsonLd["name"],
            },
          ],
          opengraph: {},
          headings: {},
        },
        PAGE,
      )

      expect(offers).toStrictEqual([
        {
          id: expect.any(String),
          url: PAGE.url,
          site: PAGE.site,
          product: product.id,
          price: undefined,
          currency: undefined,
          seller: undefined,
        },
      ])
    })

    it("extracts multiple offers", async () => {
      const offer2 = {
        "@type": ["Offer"],
        url: ["https://example.com/offer"],
        price: [20],
        priceCurrency: ["USD"],
        seller: [
          {
            "@type": ["Organization"],
            name: ["batemper"],
          },
        ],
      }

      const { offers, product } = await extractor.extract(
        {
          jsonLd: [
            {
              ...jsonLd,
              offers: [jsonLd.offers[0], offer2],
            },
          ],
          opengraph: {},
          headings: {},
        },
        PAGE,
      )

      expect(offers).toStrictEqual([
        {
          id: expect.any(String),
          url: PAGE.url,
          site: PAGE.site,
          product: product.id,
          price: jsonLd.offers[0].price[0],
          currency: jsonLd.offers[0].priceCurrency[0],
          seller: jsonLd.offers[0].seller[0].name[0],
        },
        {
          id: expect.any(String),
          url: PAGE.url,
          site: PAGE.site,
          product: product.id,
          price: offer2.price[0],
          currency: offer2.priceCurrency[0],
          seller: offer2.seller[0].name[0],
        },
      ])
    })

    it("ignores duplicated offers", async () => {
      const offer2 = {
        id: "something-different",
        ...jsonLd.offers[0],
      }

      const { offers } = await extractor.extract(
        {
          jsonLd: [
            {
              ...jsonLd,
              offers: [jsonLd.offers[0], offer2],
            },
          ],
          opengraph: {},
          headings: {},
        },
        PAGE,
      )

      expect(offers.length).toStrictEqual(1)
    })
  })
})
