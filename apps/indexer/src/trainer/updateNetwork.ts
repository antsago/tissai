import { randomUUID } from "crypto"
import type { Entity } from "./labeler/index.js"
import { type Db } from "@tissai/db"

export async function updateNetwork({ category, properties }: Entity, db: Db) {
  const { id: categoryId } = await db.nodes.upsert({
    id: randomUUID(),
    parent: null,
    name: category,
    tally: 1,
  })

  await Promise.all(
    properties.map(async (property) => {
      const { id: labelId } = await db.nodes.upsert({
        id: randomUUID(),
        parent: categoryId,
        name: property.label,
        tally: 1,
      })

      await db.nodes.upsert({
        id: randomUUID(),
        parent: labelId,
        name: property.value,
        tally: 1,
      })
    }),
  )
}
