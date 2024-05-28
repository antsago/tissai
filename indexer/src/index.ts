import { Db, Page, PAGES } from "./Db/index.js"
import parsePage from "./parsePage.js"
import EntityExtractor from "./EntityExtractor/index.js"

const db = Db()
const extractEntities = EntityExtractor()

try {
  const pages = db.stream<Page>(`SELECT * FROM ${PAGES}`)
  for await (let page of pages) {
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
  }
} catch (err) {
} finally {
  await db.close()
}
