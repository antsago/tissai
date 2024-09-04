import { expect, describe, test, beforeEach } from "vitest"
import { mockDbFixture, queries } from "@tissai/db/mocks"
import { Attribute, Db, type Seller } from "@tissai/db"
import attribute from "./attribute.js"

type Fixtures = { pg: mockDbFixture }
const it = test.extend<Fixtures>({
  pg: [mockDbFixture as any, { auto: true }],
})

describe("attribute", () => {
  const PRODUCT_ID = "product-id"
  const LABEL = "key"
  const VALUE = "value"

  let db: Db
  beforeEach<Fixtures>(({ pg }) => {
    pg.pool.query.mockResolvedValue({ rows: [] })
    db = Db()
  })

  it("extracts attribute", async ({ pg }) => {
    const result = await attribute({ label: LABEL, value: VALUE }, PRODUCT_ID, db)

    expect(result).toStrictEqual({
      id: expect.any(String),
      label: LABEL,
      value: VALUE,
      product: PRODUCT_ID,
    })
    expect(pg).toHaveExecuted(queries.attributes.create(result!))
  })

  // it("turns name to lowercase", async () => {
  //   const result = await attribute({ name: [NAME.toUpperCase()] }, db)

  //   expect(result).toStrictEqual({ name: NAME })
  // })
})
