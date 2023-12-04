const Indexer = require("./Indexer")

describe("Indexer", () => {
  let indexer
  let content
  beforeEach(() => {
    indexer = new Indexer()
    content = { jsonLD: { product: { name: "The product name" } } }
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

      expect(result).toStrictEqual(expect.objectContaining({
        id: expect.any(String),
      }))
    })

    it("returns the name from jsonLD", () => {
      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(expect.objectContaining({
        name: content.jsonLD.product.name,
      }))
    })
  })
})
