import { Crawler } from "../Crawler/index.js"
import { Page, query } from "@tissai/db"
import { parsePage } from "../trainer/parsePage/index.js"
import { tokenizerFixture, dbFixture } from "../trainer/fixtures.js"
import { extractEntities } from "./extractEntities.js"
import { storeEntities } from "./storeEntities.js"

await new Crawler({
  db: dbFixture,
  tokenizer: tokenizerFixture,
})
  .over(({ db }) =>
    db.stream<Page>(query.selectFrom("pages").selectAll().compile()),
  )
  .expect(async ({ db }) => {
    const [{ total }] = await db.query(
      query
        .selectFrom("pages")
        .select(({ fn }) => fn.count("id").as("total"))
        .compile(),
    )
    return total as number
  })
  .forEach(async (page, { db, tokenizer }) => {
    const info = await parsePage(page.body)
    const entities = await extractEntities(info, page, tokenizer, db)
    await storeEntities(entities, db)
  })
  .crawl()
