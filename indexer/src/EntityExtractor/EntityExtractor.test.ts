import { expect, describe, it, beforeEach, vi } from "vitest"
import { MockPython, AUGMENTED_DATA, PAGE } from "#mocks"
import EntityExtractor from "./EntityExtractor.js"

const jsonLd = {
  "@context": ["https://schema.org/"],
  "@type": ["Product"],
  name: ["The name of the product"],
  productID: ["121230"],
  brand: [{
    "@type": ["Brand"],
    name: ["WEDZE"],
    image: ["https://brand.com/image.jpg"],
  }],
  description: ["The description"],
  image: ["https://example.com/image.jpg"],
  offers: [{
    "@type": ["Offer"],
    url: ["https://example.com/offer"],
    price: [10],
    priceCurrency: ["EUR"],
    seller: [{
      "@type": ["Organization"],
      name: ["Pertemba"],
    }],
  }]
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
const DERIVED_DATA = {
  ...AUGMENTED_DATA,
  embedding: JSON.parse(AUGMENTED_DATA.embedding),
}

describe("EntityExtractor", () => {
  let extract
  let python: MockPython
  beforeEach(async () => {
    python = MockPython()
    extract = EntityExtractor()
  })

  describe("categories", () => {
    it("extracts category", async () => {
      python.mockImplementation(() => DERIVED_DATA)
  
      const { category } = await extract(
        { jsonLd: [jsonLd], opengraph: {}, headings: {} },
        PAGE,
      )
  
      expect(category).toStrictEqual({
        name: DERIVED_DATA.category,
      })
    })
  })

  describe("tags", () => {
    it("extracts tag", async () => {
      python.mockImplementation(() => DERIVED_DATA)
  
      const { tags } = await extract(
        { jsonLd: [jsonLd], opengraph: {}, headings: {} },
        PAGE,
      )
  
      expect(tags).toStrictEqual([{
        name: DERIVED_DATA.tags[0],
      }])
    })
  
    it("extracts multiple tags", async () => {
      const foundTags = ["two", "tags"]
      python.mockImplementation(() => ({
        ...DERIVED_DATA,
        tags: foundTags,
      }))
  
      const { tags } = await extract(
        { jsonLd: [jsonLd], opengraph: {}, headings: {} },
        PAGE,
      )
  
      expect(tags).toStrictEqual([
        { name: foundTags[0] },
        { name: foundTags[1] },
      ])
    })
  })

  describe("products", () => {
    it("extracts product", async () => {
      python.mockImplementation(() => DERIVED_DATA)
  
      const { product } = await extract(
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
      python.mockImplementation(() => DERIVED_DATA)
  
      const { product } = await extract(
        { jsonLd: [{
          "@context": jsonLd["@context"],
          "@type": jsonLd["@type"],
          "name": jsonLd["name"],
        }], opengraph: {}, headings: {} },
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
      python.mockImplementation(() => DERIVED_DATA)
  
      const { product } = await extract(
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
      python.mockImplementation(() => DERIVED_DATA)
  
      const { product } = await extract(
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
      python.mockImplementation(() => DERIVED_DATA)
  
      const { product } = await extract(
        { jsonLd: [], opengraph: { ...opengraph, "og:type": "foo" }, headings },
        PAGE,
      )
  
      expect(product).toStrictEqual(expect.objectContaining({
        title: headings.title,
      }))
    })
  })

  describe("offers", () => {
    it("extracts offer", async () => {
      python.mockImplementation(() => DERIVED_DATA)
  
      const { offers } = await extract(
        { jsonLd: [jsonLd], opengraph: {}, headings: {} },
        PAGE,
      )
  
      expect(offers).toStrictEqual([{
        id: expect.any(String),
        url: PAGE.url,
        site: PAGE.site,
        product: expect.any(String),
        price: jsonLd.offers[0].price[0],
        currency: jsonLd.offers[0].priceCurrency[0],
        seller: jsonLd.offers[0].seller[0].name[0],
      }])
    })
  })
})
