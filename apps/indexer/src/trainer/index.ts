import { type Db, Page, query } from "@tissai/db"
import { type Compiler } from "../parser/index.js"
import { type Helpers, PageServer } from "../PageServer/index.js"
import { compilerFixture } from "./schemas.js"
import { processPage } from "./processPage.js"
import { dbFixture } from "../PageServer/dbFixture.js"

const createStream = async ({ db }: Helpers<{ compiler: Compiler, db: Db }>) => {
  const baseQuery = query.selectFrom("pages").limit(2)
  const [{ total }] = await db.query(
    baseQuery.select(({ fn }) => fn.countAll().as("total")).compile(),
  )
  const pages = db.stream<Page>(baseQuery.selectAll().compile())

  return { total: total as number, pages }
}

await new PageServer(createStream)
  .with({ compiler: compilerFixture, db: dbFixture })
  .onPage(processPage)
  .start()
