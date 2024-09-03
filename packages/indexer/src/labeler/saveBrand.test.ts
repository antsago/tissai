import { expect, describe, test, beforeEach } from "vitest"
import { mockDbFixture, queries } from "@tissai/db/mocks"
import { type Brand, Db } from "@tissai/db"
import { saveBrand } from "./saveBrand.js"

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
    const result = await saveBrand({ name: NAME, logo: LOGO }, db)

    expect(result).toStrictEqual({
      name: NAME,
      logo: LOGO,
    })
    expect(pg).toHaveExecuted(queries.brands.create(result as Brand))
  })

  it("reuses existing brands", async ({ pg }) => {
    const existing = { name: NAME, logo: LOGO }
    pg.pool.query.mockResolvedValueOnce({ rows: [existing] })

    const result = await saveBrand({ name: NAME.toLowerCase() }, db)

    expect(result).toStrictEqual(existing)
    expect(pg).not.toHaveExecuted(queries.brands.create(existing))
  })

  it("updates missing information", async ({ pg }) => {
    const existing = { name: NAME }
    pg.pool.query.mockResolvedValueOnce({ rows: [existing] })

    const result = await saveBrand(
      { name: NAME.toLowerCase(), logo: LOGO },
      db,
    )

    expect(result).toStrictEqual({ name: NAME, logo: LOGO })
    expect(pg).toHaveExecuted(queries.brands.update(result as Brand))
  })

  it("handles new brands without logo", async () => {
    const result = await saveBrand({ name: NAME }, db)

    expect(result).toStrictEqual({
      name: NAME,
      logo: undefined,
    })
  })
})