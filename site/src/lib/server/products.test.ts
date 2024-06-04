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
    pg.pool.query.mockResolvedValueOnce({ rows: [SIMILAR] })
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
    pg.pool.query.mockResolvedValueOnce({
      rows: [
        {
          title: PRODUCT.name,
          description: PRODUCT.description,
          images: PRODUCT.images,
          similar: [
            {
              title: SIMILAR.name,
              id: SIMILAR.id,
              image: SIMILAR.image,
            },
          ],
          offers: [
            {
              url: PRODUCT.product_uri,
              price: 10,
              currency: "EUR",
              seller: "The seller",
              site_name: PRODUCT.shop_name,
              icon: "https://example.com/icon",
            },
          ],
        },
      ],
    })

    const result = await products.getDetails(PRODUCT.id)

    expect(result).toStrictEqual({
      name: PRODUCT.name,
      description: PRODUCT.description,
      images: PRODUCT.images,
      similar: [SIMILAR],
      product_uri: PRODUCT.product_uri,
      shop_name: PRODUCT.shop_name,
    })
    expect(pg.pool.query).toHaveBeenCalledWith(expect.any(String), [PRODUCT.id])
  })
})
