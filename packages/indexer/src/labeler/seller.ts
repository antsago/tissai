import type { Seller, Db } from "@tissai/db"

async function seller(
  { name }: Seller,
  db: Db,
): Promise<Seller> {
  const entity = {
    name: name.toLowerCase(),
  }
  await db.sellers.create(entity)

  return entity
}

export default seller