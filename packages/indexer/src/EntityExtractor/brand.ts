import type { Brand, Db } from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"

async function brand(
  { brandName, brandLogo }: JsonLD,
  db: Db,
): Promise<Brand | undefined> {
  if (!brandName) {
    return undefined
  }

  const entity = { name: brandName, logo: brandLogo }
  const [existingBrand] = await db.query<Brand>('SELECT * FROM brands WHERE similarity(name, $1) >= 1 LIMIT 1', [brandName])

  if (existingBrand) {
    return existingBrand
  }

  await db.brands.create(entity)
  return entity
}
export default brand
