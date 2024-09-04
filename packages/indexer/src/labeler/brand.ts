import type { Brand, Db } from "@tissai/db"

export async function brand({ name, logo }: Brand, db: Db): Promise<Brand> {
  const existing = await db.brands.byName(name)

  if (!existing) {
    const entity = { name, logo }
    await db.brands.create(entity)
    return entity
  }

  if (existing.logo || !logo) {
    return existing
  }

  const updated = {
    ...existing,
    logo,
  }
  await db.brands.update(updated)

  return updated
}
