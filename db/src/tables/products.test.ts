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
    const product = {
      id: "1a13b49d-b43d-4eba-838d-a77c9d94f743",
      title: PRODUCT.title,
      description: PRODUCT.description,
      images: [PRODUCT.image],
      brand: BRAND.name,
      embedding: DERIVED_DATA.embedding,
      category: DERIVED_DATA.category,
      tags: DERIVED_DATA.tags,
    }
    await create(connection)(PAGE.id, product)

    expect(pg).toHaveInserted(PRODUCTS, [
      product.id,
      product.title,
      JSON.stringify(product.embedding),
      product.category,
      product.tags,
      product.description,
      product.images,
      product.brand,
    ])
    expect(pg).toHaveInserted(TRACES, [
      PAGE.id,
      PRODUCTS.toString(),
      product.id,
    ])
  })
})
