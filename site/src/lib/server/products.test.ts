import { describe, it, expect, beforeEach } from "vitest"
import { PRODUCT, SIMILAR, QUERY, EMBEDDING, MockPg } from "mocks"
import { Products } from "./products"

describe("Products", () => {
  let pg: MockPg
  let products: Products
  beforeEach(() => {
    pg = MockPg()

    products = Products()
  })

  it("returns searched products", async () => {
    pg.pool.query.mockResolvedValueOnce({ rows: [SIMILAR] })

    const result = await products.search(QUERY)

    expect(result).toStrictEqual([SIMILAR])
    expect(pg.pool.query).toHaveBeenCalledWith(
      expect.stringContaining(`ORDER BY embedding <-> '[${EMBEDDING}]`),
      undefined,
    )
  })

  it("returns product details", async () => {
    const expected = {
      ...PRODUCT,
      similar: [SIMILAR],
    }
    pg.pool.query.mockResolvedValueOnce({ rows: [expected] })

    const result = await products.getDetails(PRODUCT.id)

    expect(result).toStrictEqual(expected)
    expect(pg.pool.query).toHaveBeenCalledWith(
      expect.stringContaining(PRODUCT.id),
      undefined,
    )
    expect(pg.pool.query).toHaveBeenCalledWith(
      expect.stringContaining("ORDER BY p2.embedding"),
      undefined,
    )
  })
})
