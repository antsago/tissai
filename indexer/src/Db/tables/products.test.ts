import { expect, describe, it, beforeEach } from "vitest"
import { DERIVED_DATA, MockPg, PAGE, PRODUCT, BRAND } from "#mocks"
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
    const productId = "1a13b49d-b43d-4eba-838d-a77c9d94f743"
    await create(connection)(PAGE.id, productId, PRODUCT.title, DERIVED_DATA.embedding, DERIVED_DATA.category, DERIVED_DATA.tags, PRODUCT.description, [PRODUCT.image], BRAND.name)

    expect(pg).toHaveInserted(PRODUCTS, [productId, PRODUCT.title, JSON.stringify(DERIVED_DATA.embedding), DERIVED_DATA.category, DERIVED_DATA.tags, PRODUCT.description, [PRODUCT.image], BRAND.name])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, PRODUCTS.toString(), productId])
  })
})
