import type { Db } from "@tissai/db"
import { type Entities } from "./extractEntities.js"

export async function storeEntities(entities: Entities, db: Db) {
  entities.brand && (await db.brands.upsert(entities.brand))
  await db.products.create(entities.product)
  await Promise.all(entities.attributes.map((att) => db.attributes.create(att)))
  await Promise.all(entities.sellers.map((s) => db.sellers.create(s)))
  await Promise.all(entities.offers.map((o) => db.offers.create(o)))
}
