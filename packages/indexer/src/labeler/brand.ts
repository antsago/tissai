import type { Brand, Db } from "@tissai/db"

export async function brand(raw: { name: string[], logo?: string[] }|undefined, db: Db): Promise<Brand|undefined> {
  if (!raw || !raw.name) {
    return undefined
  }

  const name = raw.name[0]
  const logo = raw.logo?.[0]
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
