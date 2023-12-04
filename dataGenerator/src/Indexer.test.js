const Indexer = require("./Indexer")

describe("Indexer", () => {
  let indexer
  beforeEach(() => {
    indexer = new Indexer()
  })

  describe("shouldIndex", () => {
    it("filters pages without product jsonLD", () => {
      const content = { jsonLD: { other: [] } }
  
      const result = indexer.isProductPage(content)
  
      expect(result).toBe(false)
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
