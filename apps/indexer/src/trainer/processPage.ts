import { NonMatch, Type, type Compiler } from "../parser/index.js"
import { type OnPage } from "../PageServer/index.js"
import { ProductType } from "./schemas.js"
import { updateNetwork } from "./updateNetwork.js"

export const processPage: OnPage<Compiler> = async (
  page,
  { compiler, db, reporter },
) => {
  const entities = await compiler.parse(page.body)

  if (entities === NonMatch) {
    reporter.log(`Failed to match page ${page.id} (${page.url})`)
    return
  }

  const entity = entities
    .filter((entity) => entity[Type] === ProductType)
    .map((product) => product.schemas[0])[0]

  await updateNetwork(entity, db)
}
