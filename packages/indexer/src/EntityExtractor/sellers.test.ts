import { expect, describe, test, beforeEach } from "vitest"
import { mockDbFixture } from "@tissai/db/mocks"
import { Db, SELLERS } from "@tissai/db"
import sellers from "./sellers"

type Fixtures = { pg: mockDbFixture }
const it = test.extend<Fixtures>({
  pg: [mockDbFixture as any, { auto: true }],
})

describe("sellers", () => {
  const NAME = "pertemba"

  let db: Db
  beforeEach<Fixtures>(({ pg }) => {
    pg.pool.query.mockResolvedValue({ rows: [] })
    db = Db()
  })

  it("handles empty offers", async ({ pg }) => {
    const result = await sellers({ offers: [] }, db)

    expect(result).toStrictEqual([])
    expect(pg).not.toHaveInserted(SELLERS)
  })

  it("extracts seller", async ({ pg }) => {
    const result = await sellers({ offers: [{ seller: NAME }] }, db)

    expect(result).toStrictEqual([{ name: NAME }])
    expect(pg).toHaveInserted(SELLERS, [NAME])
  })

  it("turns name to lowercase", async () => {
    const result = await sellers({ offers: [{ seller: NAME.toUpperCase() }] }, db)

    expect(result).toStrictEqual([{ name: NAME }])
  })

  it("extracts multiple sellers", async ({ pg }) => {
    const seller2 = "batemper"
    const result = await sellers({
      offers: [{ seller: NAME }, { seller: seller2 }],
    }, db)

    expect(result).toStrictEqual([{ name: NAME }, { name: seller2 }])
    expect(pg).toHaveInserted(SELLERS, [NAME])
    expect(pg).toHaveInserted(SELLERS, [seller2])
  })

  it("handles offers without sellers", async () => {
    const result = await sellers({ offers: [{}] }, db)

    expect(result).toStrictEqual([])
  })
})
