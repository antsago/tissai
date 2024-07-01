import type { Brand, Db } from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"

async function brand(
  { brandName, brandLogo }: JsonLD,
  db: Db,
): Promise<Brand | undefined> {
  if (!brandName) {
    return undefined
  }

  const [existingBrand] = await db.query<Brand>('SELECT * FROM brands WHERE similarity(name, $1) >= 1 LIMIT 1', [brandName])
  
  if (existingBrand) {
    if (!existingBrand.logo && brandLogo) {
      await db.query<[]>('UPDATE brands SET logo = $2 WHERE name = $1', [existingBrand.name, brandLogo])

      return {
        ...existingBrand,
        logo: brandLogo,
      }
    }
    return existingBrand
  }

  const entity = { name: brandName, logo: brandLogo }
  await db.brands.create(entity)
  return entity
}
export default brand
