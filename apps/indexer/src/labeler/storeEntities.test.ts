import { describe, test } from "vitest"
import { mockDbFixture, PAGE, queries } from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { storeEntities } from "./storeEntities.js"

const it = test.extend({
  db: mockDbFixture,
})

describe("storeEntities", () => {
  it("stores entities", async ({ expect, db: pg }) => {
    const db = Db()
    const entities = {
      brand: {
        name: "brand",
        logo: "logo",
      },
      product: {
        title: "the title",
        category: "",
        attributes: [],
        images: undefined,
        description: undefined,
      },
      offers: []
    }

    await storeEntities(entities, PAGE, db)

    expect(pg).toHaveExecuted(queries.brands.upsert(entities.brand))
  })
})
