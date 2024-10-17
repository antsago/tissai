import { PageServer } from "../PageServer/index.js"
import { Page, query } from "@tissai/db"
import { extractEntities, storeEntities } from "./processPage.js"
import { compilerFixture } from "./schemas.js"
import { parsePage } from "../trainer/parsePage/index.js"
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
  .onPage(async (page, { db, tokenizer }) => {
    const info = await parsePage(page.body)
    const entities = await extractEntities(info, tokenizer, db)
    await storeEntities(entities, page, db)
  })
  .start()
