import { expect, describe, test, beforeEach } from "vitest"
import { mockDbFixture } from "@tissai/db/mocks"
import { Brand, Db, queries } from "@tissai/db"
import brand from "./brand.js"

type Fixtures = { pg: mockDbFixture }
const it = test.extend<Fixtures>({
  pg: [mockDbFixture as any, { auto: true }],
})

const NAME = "Wedze"
const LOGO = "https://brand.com/image.jpg"

describe("brands", () => {
  let db: Db
  beforeEach<Fixtures>(({ pg }) => {
    pg.pool.query.mockResolvedValue({ rows: [] })
    db = Db()
  })

  it("extracts new brands", async ({ pg }) => {
    const result = await brand({ brandName: NAME, brandLogo: LOGO }, db)

    expect(result).toStrictEqual({
      name: NAME,
      logo: LOGO,
    })
    expect(pg).toHaveExecuted(queries.brands.create(result as Brand))
  })

  it("reuses existing brands", async ({ pg }) => {
    const existing = { name: NAME, logo: LOGO }
    pg.pool.query.mockResolvedValueOnce({ rows: [existing] })

    const result = await brand({ brandName: NAME.toLowerCase() }, db)

    expect(result).toStrictEqual(existing)
    expect(pg).not.toHaveExecuted(queries.brands.create(existing))
  })

  it("updates missing information", async ({ pg }) => {
    const existing = { name: NAME }
    pg.pool.query.mockResolvedValueOnce({ rows: [existing] })

    const result = await brand(
      { brandName: NAME.toLowerCase(), brandLogo: LOGO },
      db,
    )

    expect(result).toStrictEqual({ name: NAME, logo: LOGO })
    expect(pg).toHaveExecuted(queries.brands.update(result as Brand))
  })

  it("handles new brands without logo", async () => {
    const result = await brand({ brandName: NAME }, db)

    expect(result).toStrictEqual({
      name: NAME,
      logo: undefined,
    })
  })

  it("handles pages without brand", async ({ pg }) => {
    const result = await brand({}, db)

    expect(result).toBe(undefined)
    expect(pg).not.toHaveExecuted(queries.brands.create({} as Brand))
  })
})
