import { PageServer } from "../PageServer/index.js"
import { Page, query } from "@tissai/db"
import { processPage } from "./processPage.js"
import { compilerFixture } from "./schemas.js"
import { dbFixture } from "../PageServer/dbFixture.js"
import { tokenizerFixture } from "../trainer/schemas.js"

await new PageServer({
  compiler: compilerFixture,
  tokenizer: tokenizerFixture,
  db: dbFixture,
})
  .query(async ({ db }) => {
    const baseQuery = query.selectFrom("pages")
    const [{ total }] = await db.query(
      baseQuery.select(({ fn }) => fn.count("id").as("total")).compile(),
    )
    const pages = db.stream<Page>(baseQuery.selectAll().compile())

    return { total: total as number, pages }
  })
  .onPage(processPage)
  .start()
