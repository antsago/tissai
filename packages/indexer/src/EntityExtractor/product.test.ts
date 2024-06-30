import { expect, describe, test, beforeEach } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { BRAND, CATEGORY, DERIVED_DATA, TAG } from "#mocks"
import { PythonPool } from "@tissai/python-pool"
import { mockDbFixture } from "@tissai/db/mocks"
import { Db, PRODUCTS } from "@tissai/db"
import product from "./product.js"

type Fixtures = {
  mockPython: mockPythonFixture
  pg: mockDbFixture
}

const it = test.extend<Fixtures>({
  mockPython: [mockPythonFixture, { auto: true }],
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
  let pool: PythonPool<any, any>
  beforeEach<Fixtures>(async ({ mockPython, pg }) => {
    pool = PythonPool("script", { log: () => {} })
    mockPython.mockReturnValue(DERIVED_DATA)

    db = Db()
    pg.pool.query.mockResolvedValue({ rows: [] })
  })

  it("extracts product", async ({ mockPython, pg }) => {
    const expected = {
      id: expect.any(String),
      title: TITLE,
      images: JSON_LD.image,
      description: JSON_LD.description,
      brand: BRAND.name,
      category: CATEGORY.name,
      tags: [TAG.name],
      embedding: DERIVED_DATA.embedding,
    }

    const result = await product(
      JSON_LD,
      HEAD,
      OG,
      TITLE,
      pool,
      CATEGORY,
      [TAG],
      db,
      BRAND,
    )

    expect(result).toStrictEqual(expected)
    expect(mockPython.worker.send).toHaveBeenCalledWith({
      method: "embedding",
      input: TITLE,
    })
    expect(pg).toHaveInserted(PRODUCTS, [
      expected.title,
      expected.images,
      expected.description,
      expected.brand,
      expected.category,
      expected.tags,
    ])
  })

  it("handles title-only product", async () => {
    const result = await product({}, {}, {}, TITLE, pool, CATEGORY, [], db)

    expect(result).toStrictEqual({
      id: expect.any(String),
      title: TITLE,
      images: undefined,
      description: undefined,
      brand: undefined,
      category: CATEGORY.name,
      tags: [],
      embedding: DERIVED_DATA.embedding,
    })
  })

  it("defaults to opengraph", async () => {
    const result = await product({}, HEAD, OG, TITLE, pool, CATEGORY, [], db)

    expect(result).toStrictEqual({
      id: expect.any(String),
      title: TITLE,
      images: OG.image,
      description: OG.description,
      brand: undefined,
      category: CATEGORY.name,
      tags: [],
      embedding: DERIVED_DATA.embedding,
    })
  })

  it("defaults to headings", async () => {
    const result = await product({}, HEAD, {}, TITLE, pool, CATEGORY, [], db)

    expect(result).toStrictEqual({
      id: expect.any(String),
      title: TITLE,
      images: undefined,
      description: HEAD.description,
      brand: undefined,
      category: CATEGORY.name,
      tags: [],
      embedding: DERIVED_DATA.embedding,
    })
  })
})
