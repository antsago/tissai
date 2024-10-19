import { describe, test } from "vitest"
import { BRAND, dbFixture } from "#mocks"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("brands", () => {
  it("inserts if new", async ({ expect, db }) => {
    await db.brands.upsert(BRAND)

    const brands = await db.brands.getAll()
    expect(brands).toStrictEqual([BRAND])
  })

  it("handles partial brand", async ({ expect, db }) => {
    const brand = { name: BRAND.name }

    await db.brands.upsert(brand)

    const brands = await db.brands.getAll()
    expect(brands).toStrictEqual([{ ...brand, logo: null }])
  })

  it("updates logo if not set", async ({ expect, db }) => {
    await db.load({ brands: [{ name: BRAND.name }] })

    await db.brands.upsert(BRAND)

    const brands = await db.brands.getAll()
    expect(brands).toStrictEqual([BRAND])
  })

  it("preserves logo if not given", async ({ expect, db }) => {
    await db.load({ brands: [BRAND] })

    await db.brands.upsert({ name: BRAND.name })

    const brands = await db.brands.getAll()
    expect(brands).toStrictEqual([BRAND])
  })

  it("updates logo if new is given", async ({ expect, db }) => {
    await db.load({ brands: [{ name: BRAND.name, logo: "an old logo" }] })

    await db.brands.upsert(BRAND)

    const brands = await db.brands.getAll()
    expect(brands).toStrictEqual([BRAND])
  })
})
