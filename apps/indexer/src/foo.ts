import { CATEGORY_LABEL, Db } from "@tissai/db"
import { randomUUID } from "crypto"

const db = Db()
await db.initialize()

const schemas = await db.schemas.getAll()
await Promise.all(schemas.map(async schema => {
  if (schema.label === CATEGORY_LABEL) {
    await db.nodes.upsert({ id: randomUUID(), name: schema.category, parent: null, tally: schema.tally })
    return
  }

  const { id: categoryId } = await db.nodes.upsert({ id: randomUUID(), name: schema.category, parent: null, tally: 0 })
  const { id: labelId } = await db.nodes.upsert({ id: randomUUID(), name: schema.label, parent: categoryId, tally: schema.tally })
  await db.nodes.upsert({ id: randomUUID(), parent: labelId, name: schema.value, tally: schema.tally})
}))
