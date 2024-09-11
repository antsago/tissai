import { type Compiler, type Model, NonMatch } from "../parser/index.js"
import { type OnPage, type Helpers, PageServer } from "../PageServer/index.js"
import { updateModel } from "./updateModel.js"
import { compilerFixture } from "./compilerFixture.js"
import { Db, Page, query } from "@tissai/db"

const MODEL: Model = {
  vocabulary: {},
  schemas: {},
}

const processPage: OnPage<Compiler> = async (page: Page, { compiler }) => {
  const entities = await compiler.parse(page.body)

  if (entities !== NonMatch) {
    updateModel(entities, MODEL)
  }
}

const createStream = async ({ db }: Helpers<Compiler>) => {
  const baseQuery = query.selectFrom("pages")
  const [{ total }] = await db.query(
    baseQuery.select(({ fn }) => fn.count("id").as("total")).compile(),
  )
  const pages = db.stream<Page>(baseQuery.selectAll().compile())

  return { total: total as number, pages }
}

await new PageServer<Compiler>(createStream)
  .with(compilerFixture)
  .onPage(processPage)
  .start()

console.log(JSON.stringify(MODEL))
