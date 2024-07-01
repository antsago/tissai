import type { Brand, Db } from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"

async function brand(
  { brandName, brandLogo }: JsonLD,
  db: Db,
): Promise<Brand | undefined> {
  if (!brandName) {
    return undefined
  }

  const existingBrand = await db.brands.byName(brandName)
  
  if (!existingBrand) {
    const entity = { name: brandName, logo: brandLogo }
    await db.brands.create(entity)
    return entity
  }
  
  if (existingBrand.logo || !brandLogo) {
    return existingBrand
  }

  await db.query<[]>('UPDATE brands SET logo = $2 WHERE name = $1', [existingBrand.name, brandLogo])

  return {
    ...existingBrand,
    logo: brandLogo,
  }
}
export default brand
