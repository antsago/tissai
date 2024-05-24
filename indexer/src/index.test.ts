import { expect, describe, it, beforeEach, vi } from "vitest"
import { MockPg, PRODUCT, AUGMENTED_DATA, pageWithSchema } from "#mocks"
import {
  BRANDS,
  CATEGORIES,
  OFFERS,
  PRODUCTS,
  SELLERS,
  TAGS,
} from "./Db/index.js"
import { EventEmitter } from "stream"

function MockPython(setPShell) {
  const eventEmitter = new EventEmitter<{ message: [unknown] }>()
  const send = vi.fn()
  const worker = Object.assign(eventEmitter, { send })
  
  const pythonShell = vi.fn().mockReturnValue(worker)
  setPShell(pythonShell as any)

  return { worker }
}

describe("indexer", () => {
  let pg: MockPg
  let python: ReturnType<typeof MockPython>
  beforeEach(async () => {
    vi.resetModules()

    const { MockPg } = await import("#mocks")
    pg = MockPg()
    const { setPShell } = await import("./EntityExtractor/index.js")
    python = await MockPython(setPShell)
  })

  it("handles title-only products", async () => {
    const page = pageWithSchema({
      "@type": "Product",
      name: PRODUCT.title,
    })
    pg.query.mockResolvedValueOnce({ rows: [page] })
    
    python.worker.send.mockImplementation(() => {
      python.worker.emit("message", { ...AUGMENTED_DATA, embedding: JSON.parse(AUGMENTED_DATA.embedding) })
    })
    await import("./index.js")

    expect(pg).toHaveInserted(PRODUCTS)
    expect(pg).toHaveInserted(OFFERS)
    expect(pg).toHaveInserted(CATEGORIES)
    expect(pg).toHaveInserted(TAGS)
    expect(pg).not.toHaveInserted(SELLERS)
    expect(pg).not.toHaveInserted(BRANDS)
  })
})
