import { Page, query } from "@tissai/db"
import { type Model, NonMatch, Type, type Compiler } from "../parser/index.js"
import { type OnPage, type Helpers, PageServer } from "../PageServer/index.js"
import { compilerFixture, ProductType } from "./schemas.js"

const processPage: OnPage<Compiler> = async (page, { compiler, db, reporter }) => {
  const entities = await compiler.parse(page.body)

  if (entities === NonMatch) {
    reporter.log(`Failed to match page ${page.id} (${page.url})`)
    return
  }

  const schemas = entities
    .filter((entity) => entity[Type] === ProductType)
    .map((product) => product.schemas[0])

  await Promise.all(schemas.map((schema) => db.schemas.upsert(schema)))
}

const createStream = async ({ db }: Helpers<Compiler>) => {
  const baseQuery = query.selectFrom("pages")
  const [{ total }] = await db.query(
    baseQuery.select(({ fn }) => fn.count("id").as("total")).compile(),
  )
  const pages = db.stream<Page>(baseQuery.selectAll().compile())

  return { total: total as number, pages }
}

await new PageServer(createStream)
  .with(compilerFixture)
  .onPage(processPage)
  .start()
