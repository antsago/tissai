import { describe, test } from "vitest"
import { BRAND, dbFixture } from "#mocks"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("brands", () => {
  it("inserts if new", async ({ expect, db }) => {
    const result = await db.brands.upsert(BRAND)

    const brands = await db.brands.getAll()
    expect(brands).toStrictEqual([BRAND])
    expect(result).toStrictEqual({ name: BRAND.name })
  })

  it("updates logo if not set", async ({ expect, db }) => {
    await db.load({ brands: [{ name: BRAND.name }] })

    const result = await db.brands.upsert(BRAND)

    const brands = await db.brands.getAll()
    expect(brands).toStrictEqual([BRAND])
    expect(result).toStrictEqual({ name: BRAND.name })
  })

  it("updates logo if already set", async ({ expect, db }) => {
    await db.load({ brands: [{ name: BRAND.name, logo: "an old logo" }] })

    const result = await db.brands.upsert(BRAND)

    const brands = await db.brands.getAll()
    expect(brands).toStrictEqual([BRAND])
    expect(result).toStrictEqual({ name: BRAND.name })
  })

  it("searches for brand by name", async ({ expect, db }) => {
    await db.load({
      brands: [BRAND],
    })

    const found = await db.brands.byName(BRAND.name.toLowerCase())

    expect(found).toStrictEqual(BRAND)
  })

  it("ignores brands with different names", async ({ expect, db }) => {
    await db.load({
      brands: [BRAND],
    })

    const found = await db.brands.byName("foo")

    expect(found).toBe(undefined)
  })

  it("updates brand details", async ({ expect, db }) => {
    await db.load({
      brands: [{ name: BRAND.name }],
    })

    await db.brands.update(BRAND)
    const brands = await db.brands.getAll()

    expect(brands).toStrictEqual([BRAND])
  })
})
