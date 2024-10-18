import { describe, test } from "vitest"
import {
  ATTRIBUTE,
  BRAND,
  mockDbFixture,
  OFFER,
  PRODUCT,
  queries,
  SELLER,
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
      attributes: [ATTRIBUTE],
      sellers: [SELLER],
      offers: [OFFER],
    }

    await storeEntities(entities, db)

    expect(pg).toHaveExecuted(queries.brands.upsert(BRAND))
    expect(pg).toHaveExecuted(queries.products.create(PRODUCT))
    expect(pg).toHaveExecuted(queries.attributes.create(ATTRIBUTE))
    expect(pg).toHaveExecuted(queries.sellers.create(SELLER))
    expect(pg).toHaveExecuted(queries.offers.create(OFFER))
  })

  it("handles undefined brand", async ({ expect, db: pg }) => {
    const db = Db()
    const entities = {
      brand: undefined,
      product: PRODUCT,
      attributes: [],
      sellers: [],
      offers: [],
    }

    await storeEntities(entities, db)

    expect(pg).not.toHaveExecuted(queries.brands.upsert({} as any))
  })
})
