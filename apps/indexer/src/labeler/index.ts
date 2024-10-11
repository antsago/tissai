import { Helpers, PageServer } from "../PageServer/index.js"
import { type Db, Page, query } from "@tissai/db"
import { processPage } from "./processPage.js"
import { compilerFixture } from "./schemas.js"
import { Compiler } from "../parser/Compiler.js"
import { dbFixture } from "../PageServer/dbFixture.js"

const createStream = async ({ db }: Helpers<{ compiler: Compiler, db: Db }>) => {
  const baseQuery = query.selectFrom("pages")
  const [{ total }] = await db.query(
    baseQuery.select(({ fn }) => fn.count("id").as("total")).compile(),
  )
  const pages = db.stream<Page>(baseQuery.selectAll().compile())

  return { total: total as number, pages }
}

await new PageServer(createStream)
  .with({ compiler: compilerFixture, db: dbFixture })
  .onPage(processPage)
  .start()
