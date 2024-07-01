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
  await db.brands.create(entity)

  return entity
}
export default brand
