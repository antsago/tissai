import { expect, describe, test, beforeEach } from "vitest"
import { mockDbFixture, queries } from "@tissai/db/mocks"
import { Db, type Seller } from "@tissai/db"
import seller from "./seller.js"

type Fixtures = { pg: mockDbFixture }
const it = test.extend<Fixtures>({
  pg: [mockDbFixture as any, { auto: true }],
})

describe("seller", () => {
  const NAME = "pertemba"

  let db: Db
  beforeEach<Fixtures>(({ pg }) => {
    pg.pool.query.mockResolvedValue({ rows: [] })
    db = Db()
  })

  it("extracts seller", async ({ pg }) => {
    const result = await seller({ name: NAME }, db)

    expect(result).toStrictEqual({ name: NAME })
    expect(pg).toHaveExecuted(queries.sellers.create(result as Seller))
  })

  it("turns name to lowercase", async () => {
    const result = await seller({ name: NAME.toUpperCase() }, db)

    expect(result).toStrictEqual({ name: NAME })
  })
})