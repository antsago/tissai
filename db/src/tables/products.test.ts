import { expect, describe, it, beforeEach } from "vitest"
import { MockPg, PRODUCT } from "#mocks"
import { Connection } from "../Connection"
import { TABLE as PRODUCTS, create } from "./products"

describe("products", () => {
  let pg: MockPg
  let connection: Connection
  beforeEach(() => {
    pg = MockPg()
    connection = Connection()
  })

  it("inserts new row", async () => {
    await create(connection)(PRODUCT)

    expect(pg).toHaveInserted(PRODUCTS, [
      PRODUCT.id,
      PRODUCT.title,
      JSON.stringify(PRODUCT.embedding),
      PRODUCT.category,
      PRODUCT.tags,
      PRODUCT.description,
      PRODUCT.images,
      PRODUCT.brand,
    ])
  })
})
