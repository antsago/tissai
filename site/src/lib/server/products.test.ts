import { describe, it, expect, beforeEach } from "vitest"
import { PRODUCT, SIMILAR, QUERY, EMBEDDING, MockPg, MockPython } from "mocks"
import { Products } from "./products"

describe("Products", () => {
  let pg: MockPg
  let python: MockPython
  let products: Products
  beforeEach(() => {
    pg = MockPg()
    python = MockPython()

    products = Products()
  })

  it("returns searched products", async () => {
    pg.pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: SIMILAR.id,
          title: SIMILAR.name,
          image: SIMILAR.image,
        },
      ],
    })
    python.mockReturnValue(EMBEDDING)

    const result = await products.search(QUERY)

    expect(result).toStrictEqual([SIMILAR])
    expect(python.worker.send).toHaveBeenCalledWith(QUERY)
    expect(pg.pool.query).toHaveBeenCalledWith(
      expect.stringContaining("ORDER BY embedding <-> $1"),
      [expect.stringContaining(EMBEDDING.join(","))],
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
