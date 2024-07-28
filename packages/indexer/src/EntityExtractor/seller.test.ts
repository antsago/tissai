import { expect, describe, test, beforeEach } from "vitest"
import { mockDbFixture } from "@tissai/db/mocks"
import { Db, queries, type Seller } from "@tissai/db"
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
    const result = await seller({ seller: NAME }, db)

    expect(result).toStrictEqual({ name: NAME })
    expect(pg).toHaveExecuted(queries.sellers.create(result as Seller))
  })

  it("turns name to lowercase", async () => {
    const result = await seller({ seller: NAME.toUpperCase() }, db)

    expect(result).toStrictEqual({ name: NAME })
  })

  it("handles offers without sellers", async () => {
    const result = await seller({}, db)

    expect(result).toBe(undefined)
  })
})
