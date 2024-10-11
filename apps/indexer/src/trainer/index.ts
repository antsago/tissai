import { Page, query } from "@tissai/db"
import { type Compiler } from "../parser/index.js"
import { type Helpers, PageServer } from "../PageServer/index.js"
import { compilerFixture } from "./schemas.js"
import { processPage } from "./processPage.js"

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
