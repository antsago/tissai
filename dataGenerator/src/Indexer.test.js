const Indexer = require("./Indexer")

describe("Indexer", () => {
  let indexer
  beforeEach(() => {
    indexer = new Indexer()
  })

  describe("shouldIndex", () => {
    it("filters pages without product jsonLD", async () => {
      const content = { jsonLD: { other: [] } }
  
      const result = indexer.shouldIndex(content)
  
      expect(result).toBe(false)
    })
  })
})
