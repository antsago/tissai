import { Db, Page, PAGES } from "./Db/index.js"
import parsePage from "./parsePage.js"
import EntityExtractor from "./EntityExtractor/index.js"

const db = Db()
try {
  const extractEntities = EntityExtractor()

  await db.initialize()

  const pages = db.stream<Page>(`SELECT * FROM ${PAGES}`)
  for await (let page of pages) {
    try {
      const structuredData = parsePage(page)

      const { product, offers, category, tags, sellers, brand } =
        await extractEntities(structuredData, page)

      await Promise.all(
        [
          db.categories.create(page.id, category),
          tags.map((tag) => db.tags.create(page.id, tag)),
          sellers.map((seller) => db.sellers.create(page.id, seller)),
          brand ? db.brands.create(page.id, brand) : Promise.resolve(),
        ].flat(),
      )

      await db.products.create(page.id, product)
      await Promise.all(offers.map((offer) => db.offers.create(page.id, offer)))

      console.log(`[${page.id} | ${page.url}] Processed`)
    } catch (err) {
      console.error(`[${page.id} | ${page.url}] ${err}`)
    }
  }
} finally {
  await db.close()
}
