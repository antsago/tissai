import { expect, describe, test, beforeEach } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { BRAND, CATEGORY, DERIVED_DATA, PAGE, TAG } from "#mocks"
import product from "./product.js"
import { PythonPool } from "@tissai/python-pool"

type Fixtures = {
  mockPython: mockPythonFixture
}

const it = test.extend<Fixtures>({
  mockPython: [mockPythonFixture, { auto: true }],
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
  let pool: PythonPool<string, { embedding: number[] }>
  beforeEach<Fixtures>(async ({ mockPython }) => {
    pool = PythonPool("script", { log: () => {} })
    mockPython.mockReturnValue(DERIVED_DATA)
  })

  it("extracts product", async ({ mockPython }) => {
    const result = await product(
      JSON_LD,
      HEAD,
      OG,
      TITLE,
      pool,
      CATEGORY,
      [TAG],
      BRAND,
    )

    expect(result).toStrictEqual({
      id: expect.any(String),
      title: TITLE,
      images: JSON_LD.image,
      description: JSON_LD.description,
      brand: BRAND.name,
      category: CATEGORY.name,
      tags: [TAG.name],
      embedding: DERIVED_DATA.embedding,
    })
    expect(mockPython.worker.send).toHaveBeenCalledWith(TITLE)
  })

  it("handles title-only product", async () => {
    const result = await product({}, {}, {}, TITLE, pool, CATEGORY, [])

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
    const result = await product({}, HEAD, OG, TITLE, pool, CATEGORY, [])

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
    const result = await product({}, HEAD, {}, TITLE, pool, CATEGORY, [])

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
