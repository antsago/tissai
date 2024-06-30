import { expect, describe, test, beforeEach } from "vitest"
import { mockDbFixture } from "@tissai/db/mocks"
import { Db, BRANDS } from "@tissai/db"
import brand from "./brand.js"

type Fixtures = { pg: mockDbFixture }
const it = test.extend<Fixtures>({
  pg: [mockDbFixture as any, { auto: true }],
})

const NAME = "wedze"
const LOGO = "https://brand.com/image.jpg"

describe("brands", () => {
  let db: Db
  beforeEach<Fixtures>(({ pg }) => {
    pg.pool.query.mockResolvedValue({ rows: [] })
    db = Db()
  })

  it("extracts brand", async ({ pg }) => {
    const result = await brand({ brandName: NAME, brandLogo: LOGO }, db)

    expect(result).toStrictEqual({
      name: NAME,
      logo: LOGO,
    })
    expect(pg).toHaveInserted(BRANDS, [NAME, LOGO])
  })

  it("handles brands without logo", async () => {
    const result = await brand({ brandName: NAME }, db)

    expect(result).toStrictEqual({
      name: NAME,
      logo: undefined,
    })
  })

  it("turns name to lowercase", async () => {
    const result = await brand({ brandName: "WEDZE" }, db)

    expect(result).toStrictEqual({
      name: "wedze",
      logo: undefined,
    })
  })

  it("handles pages without brand", async ({ pg }) => {
    const result = await brand({}, db)

    expect(result).toBe(undefined)
    expect(pg).not.toHaveInserted(BRANDS)
  })
})
