import { type Page, query } from "@tissai/db"
import { Crawler } from "../Crawler/index.js"
import { dbFixture } from "../Crawler/dbFixture.js"
import { llmFixture, tokenizerFixture } from "./schemas.js"
import { parsePage } from "./parsePage/index.js"
import { label } from "./labeler/index.js"
import { updateNetwork } from "./updateNetwork.js"

await new Crawler({
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
  .onPage(async (page, { llm, tokenizer, db }) => {
    const info = await parsePage(page.body)
    const interpretation = await label(llm, tokenizer)(info)
    await updateNetwork(interpretation, db)
  })
  .start()
