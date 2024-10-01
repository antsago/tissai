import { randomUUID } from "crypto"
import { Page, query } from "@tissai/db"
import { NonMatch, Type, type Compiler } from "../parser/index.js"
import { type OnPage, type Helpers, PageServer } from "../PageServer/index.js"
import { compilerFixture, ProductType } from "./schemas.js"
import { extractSchemas } from "./extractSchemas.js"

const processPage: OnPage<Compiler> = async (
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
      async (property: ReturnType<typeof extractSchemas>[number]) => {
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

const createStream = async ({ db }: Helpers<Compiler>) => {
  const baseQuery = query.selectFrom("pages").limit(2)
  const [{ total }] = await db.query(
    baseQuery.select(({ fn }) => fn.countAll().as("total")).compile(),
  )
  const pages = db.stream<Page>(baseQuery.selectAll().compile())

  return { total: total as number, pages }
}

await new PageServer(createStream)
  .with(compilerFixture)
  .onPage(processPage)
  .start()
