import { expect, describe, test, beforeEach } from "vitest"
import { BRAND } from "#mocks"
import { mockDbFixture } from "@tissai/db/mocks"
import { Db, queries } from "@tissai/db"
import product from "./product.js"

type Fixtures = {
  pg: mockDbFixture
}

const it = test.extend<Fixtures>({
  pg: [mockDbFixture as any, { auto: true }],
})

const TITLE = "Product title"
const JSON_LD = {
  image: ["https://example.com/image.jpg"],
  description: "The description",
}
const OG = {
  image: ["http://www.friendsmash.com/images/coin_600.png"],
  description: "Friend Smash Coins to purchase upgrades and items!",
}
const HEAD = {
  description: "The description in headers",
}

describe("products", () => {
  let db: Db
  beforeEach<Fixtures>(async ({ pg }) => {
    db = Db()
    pg.pool.query.mockResolvedValue({ rows: [] })
  })

  it("extracts product", async ({ pg }) => {
    const expected = {
      id: expect.any(String),
      title: TITLE,
      images: JSON_LD.image,
      description: JSON_LD.description,
      brand: BRAND.name,
    }

    const result = await product(JSON_LD, HEAD, OG, TITLE, db, BRAND)

    expect(result).toStrictEqual(expected)
    expect(pg).toHaveExecuted(queries.products.create(result))
  })

  it("handles title-only product", async () => {
    const result = await product({}, {}, {}, TITLE, db)

    expect(result).toStrictEqual({
      id: expect.any(String),
      title: TITLE,
      images: undefined,
      description: undefined,
      brand: undefined,
    })
  })

  it("defaults to opengraph", async () => {
    const result = await product({}, HEAD, OG, TITLE, db)

    expect(result).toStrictEqual({
      id: expect.any(String),
      title: TITLE,
      images: OG.image,
      description: OG.description,
      brand: undefined,
    })
  })

  it("defaults to headings", async () => {
    const result = await product({}, HEAD, {}, TITLE, db)

    expect(result).toStrictEqual({
      id: expect.any(String),
      title: TITLE,
      images: undefined,
      description: HEAD.description,
      brand: undefined,
    })
  })
})
