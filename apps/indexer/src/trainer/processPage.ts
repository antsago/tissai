import { randomUUID } from "crypto"
import { NonMatch, Type, type Compiler } from "../parser/index.js"
import { type OnPage } from "../PageServer/index.js"
import { type Property } from "./labeler/index.js"
import { ProductType } from "./schemas.js"

export const processPage: OnPage<Compiler> = async (
  page,
  { compiler, db, reporter },
) => {
  const entities = await compiler.parse(page.body)

  if (entities === NonMatch) {
    reporter.log(`Failed to match page ${page.id} (${page.url})`)
    return
  }

  const { category, properties } = entities
    .filter((entity) => entity[Type] === ProductType)
    .map((product) => product.schemas[0])[0]

  const { id: categoryId } = await db.nodes.upsert({
    id: randomUUID(),
    parent: null,
    name: category,
    tally: 1,
  })
  await Promise.all(
    properties.map(
      async (property: Property) => {
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
      },
    ),
  )
}
