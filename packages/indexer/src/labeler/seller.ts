import type { Seller, Db } from "@tissai/db"

async function seller({ name }: Seller, db: Db): Promise<Seller> {
  const entity = {
    name: name.toLowerCase(),
  }
  try {
    await db.sellers.create(entity)
  } catch {
    // do nothing, happens when seller already exists
  }

  return entity
}

export default seller
