import type { Seller, Db } from "@tissai/db"

async function seller(
  raw: undefined | { name?: string[] },
  db: Db,
): Promise<undefined | Seller> {
  if (!raw || !raw.name) {
    return undefined
  }

  const entity = {
    name: raw.name[0].toLowerCase(),
  }
  try {
    await db.sellers.create(entity)
  } catch {
    // do nothing, happens when seller already exists
  }

  return entity
}

export default seller
