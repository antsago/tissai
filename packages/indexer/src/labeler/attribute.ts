import type { Db, Attribute } from "@tissai/db"
import { randomUUID } from "crypto"

async function attribute(raw: { key: string, value: string }, product: string, db: Db): Promise<Attribute> {
  const entity = {
    id: randomUUID(),
    product,
    label: raw.key,
    value: raw.value,
  }

  await db.attributes.create(entity)

  return entity
}

export default attribute
