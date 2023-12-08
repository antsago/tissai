const Indexer = require("./Indexer")

describe("Indexer", () => {
  const SHOP = {
    name: "Example",
    domain: "example.com",
    icon: "https://example.com/icon",
  }

  let indexer
  let content
  beforeEach(() => {
    indexer = new Indexer([SHOP])
    content = {
      url: `https://${SHOP.domain}/product`,
      jsonLD: {
        product: {
          name: "The product name",
          description: "The description in ld",
          image: "https//image.com/png",
          brand: { name: "BRAND" },
        },
      },
      openGraph: {
        type: "product",
        title: "The name in og",
        description: "The description in og",
        url: `https://${SHOP.domain}/product`,
        image: `https//image.com/og-image`,
      },
      headings: {
        description: "The description in headings",
        canonical: "https://example.com/product",
      },
    }
  })

  describe("shouldIndex", () => {
    it("accepts pages with product jsonLD", () => {
      delete content.openGraph

      const result = indexer.isProductPage(content)

      expect(result).toBe(true)
    })

    it("accepts pages with product openGraph", () => {
      delete content.jsonLD.product

      const result = indexer.isProductPage(content)

      expect(result).toBe(true)
    })

    it("filters pages without any product type", () => {
      delete content.jsonLD.product
      delete content.openGraph

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

    it("fallbacks to opengraph for the name", () => {
      delete content.jsonLD.product

      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          name: content.openGraph.title,
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
      delete content.jsonLD.product

      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          description: content.openGraph.description,
        }),
      )
    })

    it("secondary fallback to headings for description", () => {
      delete content.jsonLD.product
      delete content.openGraph

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

    it("fallbacks to opengraph for the image", () => {
      delete content.jsonLD.product

      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          image: content.openGraph.image,
        }),
      )
    })

    it("supports an image array from jsonLD", () => {
      content.jsonLD.product.image = [
        "https://img.com/image1",
        "https://img.com/image2",
      ]

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
          sellers: [
            expect.objectContaining({ productUrl: content.headings.canonical }),
          ],
        }),
      )
    })

    it("fallbacks to url if no cannonical", () => {
      delete content.headings.canonical

      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          sellers: [expect.objectContaining({ productUrl: content.url })],
        }),
      )
    })

    it("adds the shop for that url", () => {
      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(
        expect.objectContaining({
          sellers: [
            expect.objectContaining({
              shop: {
                name: SHOP.name,
                image: SHOP.icon,
              },
            }),
          ],
        }),
      )
    })

    it("throws if shop's domain is not found", () => {
      content.headings.canonical = "https://another.domain/product"

      const act = () => indexer.createProduct(content)

      expect(act).toThrow()
    })
  })
})
