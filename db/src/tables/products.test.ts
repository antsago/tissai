import { expect, describe, it, beforeEach } from "vitest"
import { MockPg, PAGE, PRODUCT, BRAND } from "#mocks"
import { Connection } from "../Connection"
import { TABLE as TRACES } from "./traces"
import { TABLE as PRODUCTS, create } from "./products"

describe("products", () => {
  let pg: MockPg
  let connection: Connection
  beforeEach(() => {
    pg = MockPg()
    connection = Connection()
  })

  it("inserts new row", async () => {
    await create(connection)(PAGE.id, PRODUCT)

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
    expect(pg).toHaveInserted(TRACES, [
      PAGE.id,
      PRODUCTS.toString(),
      PRODUCT.id,
    ])
  })
})
