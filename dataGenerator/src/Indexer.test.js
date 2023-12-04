const Indexer = require("./Indexer")

describe("Indexer", () => {
  let indexer
  let content
  beforeEach(() => {
    indexer = new Indexer()
    content = {
      jsonLD: {
        product: {
          name: "The product name",
          description: "The description in ld",
          image: "https//image.com/png",
          brand: { name: "BRAND" },
        },
      },
      openGraph: {
        description: "The description in og",
      },
      headings: {
        description: "The description in headings",
        canonical: "https://example.com/product",
      },
    }
  })

  describe("shouldIndex", () => {
    it("accepts pages with product jsonLD", () => {
      const result = indexer.isProductPage(content)

      expect(result).toBe(true)
    })

    it("filters pages without product jsonLD", () => {
      delete content.jsonLD.product

      const result = indexer.isProductPage(content)

      expect(result).toBe(false)
    })
  })

  describe("createProduct", () => {
    it("assigns a product id", () => {
      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
        }),
      )
    })

    it("sets the name from jsonLD", () => {
      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          name: content.jsonLD.product.name,
        }),
      )
    })

    it("sets the description from jsonLD", () => {
      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          description: content.jsonLD.product.description,
        }),
      )
    })

    it("fallbacks to openGraph for description", () => {
      delete content.jsonLD.product.description

      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          description: content.openGraph.description,
        }),
      )
    })

    it("secondary fallback to headings for description", () => {
      delete content.jsonLD.product.description
      delete content.openGraph.description

      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          description: content.headings.description,
        }),
      )
    })

    it("takes the image from jsonLD", () => {
      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          image: content.jsonLD.product.image,
        }),
      )
    })

    it("takes the brand from jsonLD", () => {
      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          brand: content.jsonLD.product.brand.name,
        }),
      )
    })

    it("supports products without brand", () => {
      delete content.jsonLD.product.brand

      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          brand: undefined,
        }),
      )
    })

    it("creates a seller with the cannonical url", () => {
      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          sellers: [{ productUrl: content.headings.canonical }],
        }),
      )
    })
  })
})
