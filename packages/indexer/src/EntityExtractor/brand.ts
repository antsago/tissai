import type { Brand, Db } from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"

async function brand({ brandName, brandLogo }: JsonLD, db: Db): Promise<Brand | undefined> {
  if (!brandName) {
    return undefined
  }

  const enitity = { name: brandName.toLowerCase(), logo: brandLogo }
  await db.brands.create(enitity)

  return enitity
}
export default brand
