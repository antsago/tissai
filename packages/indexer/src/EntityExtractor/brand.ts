import type { Brand, Db } from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"

async function brand({ brandName, brandLogo }: JsonLD, db: Db): Promise<Brand | undefined> {
  if (!brandName) {
    return undefined
  }

  const brandEntity = { name: brandName.toLowerCase(), logo: brandLogo }
  await db.brands.create(brandEntity)

  return brandEntity
}
export default brand
