import { type Page, query } from "@tissai/db"
import { PageServer } from "../PageServer/index.js"
import { llmFixture, tokenizerFixture } from "./schemas.js"
import { processPage } from "./processPage.js"
import { dbFixture } from "../PageServer/dbFixture.js"

await new PageServer({
  llm: llmFixture,
  tokenizer: tokenizerFixture,
  db: dbFixture,
})
  .query(async ({ db }) => {
    const baseQuery = query.selectFrom("pages").limit(2)
    const [{ total }] = await db.query(
      baseQuery.select(({ fn }) => fn.countAll().as("total")).compile(),
    )
    const pages = db.stream<Page>(baseQuery.selectAll().compile())

    return { total: total as number, pages }
  })
  .onPage(processPage)
  .start()
