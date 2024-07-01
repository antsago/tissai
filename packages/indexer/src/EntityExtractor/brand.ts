import type { Brand, Db } from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"

async function brand(
  { brandName, brandLogo }: JsonLD,
  db: Db,
): Promise<Brand | undefined> {
  if (!brandName) {
    return undefined
  }

  const existing = await db.brands.byName(brandName)
  
  if (!existing) {
    const entity = { name: brandName, logo: brandLogo }
    await db.brands.create(entity)
    return entity
  }
  
  if (existing.logo || !brandLogo) {
    return existing
  }

  const updated = {
    ...existing,
    logo: brandLogo,
  }
  await db.brands.update(updated)

  return updated
}
export default brand
