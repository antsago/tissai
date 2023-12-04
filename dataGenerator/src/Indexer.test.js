const Indexer = require("./Indexer")

describe("Indexer", () => {
  let indexer
  beforeEach(() => {
    indexer = new Indexer()
  })

  describe("shouldIndex", () => {
    it("filters pages without product jsonLD", () => {
      const content = { jsonLD: {} }
  
      const result = indexer.isProductPage(content)
  
      expect(result).toBe(false)
    })

    it("accepts pages with product jsonLD", () => {
      const content = { jsonLD: { product: {} } }
  
      const result = indexer.isProductPage(content)
  
      expect(result).toBe(true)
    })
  })

  describe("createProduct", () => {
    it("assigns a product id", () => {
      const content = {}

      const result = indexer.createProduct(content)

      expect(result).toStrictEqual(expect.objectContaining({
        id: expect.any(String),
      }))
    })
  })
})
