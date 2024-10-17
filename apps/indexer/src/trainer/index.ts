import { type Page, query } from "@tissai/db"
import { Crawler } from "../Crawler/index.js"
import { llmFixture, tokenizerFixture, dbFixture } from "./fixtures.js"
import { parsePage } from "./parsePage/index.js"
import { label } from "./labeler/index.js"
import { updateNetwork } from "./updateNetwork.js"

await new Crawler({
  llm: llmFixture,
  tokenizer: tokenizerFixture,
  db: dbFixture,
})
  .over(({ db }) =>
    db.stream<Page>(query.selectFrom("pages").selectAll().compile()),
  )
  .expect(async ({ db }) => {
    const [{ total }] = await db.query(
      query
        .selectFrom("pages")
        .select(({ fn }) => fn.countAll().as("total"))
        .compile(),
    )
    return total as number
  })
  .forEach(async (page, { llm, tokenizer, db }) => {
    const info = await parsePage(page.body)
    const interpretation = await label(llm, tokenizer)(info)
    await updateNetwork(interpretation, db)
  })
  .crawl()
