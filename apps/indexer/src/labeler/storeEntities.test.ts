import { describe, test } from "vitest"
import {
  ATTRIBUTE,
  BRAND,
  mockDbFixture,
  PAGE,
  PRODUCT,
  queries,
} from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { storeEntities } from "./storeEntities.js"

const it = test.extend({
  db: mockDbFixture,
})

describe("storeEntities", () => {
  it("stores entities", async ({ expect, db: pg }) => {
    const db = Db()
    const entities = {
      brand: BRAND,
      product: PRODUCT,
      attributes: [{ label: "label", value: ATTRIBUTE.value }],
      offers: [],
    }
    pg.pool.query.mockResolvedValueOnce({ rows: [{ name: BRAND.name }] })

    await storeEntities(entities, PAGE, db)

    expect(pg).toHaveExecuted(queries.brands.upsert(BRAND))
    expect(pg).toHaveExecuted(queries.products.create(PRODUCT))
  })
})
