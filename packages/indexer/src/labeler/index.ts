import { Helpers, PageServer } from "../PageServer/index.js"
import { Page, query } from "@tissai/db"
import { processPage } from "./processPage.js"
import { compilerFixture } from "./schemas.js"

const createStream = async ({ db }: Helpers) => {
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
