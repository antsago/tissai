import { BRANDS, CATEGORIES, Db, Page, PAGES, PRODUCTS, SELLERS, TAGS } from "@tissai/db"
import { reporter } from "./Reporter.js"
import parsePage from "./parsePage.js"
import { EntityExtractor } from "./EntityExtractor/index.js"

let db!: Db
let extractor!: EntityExtractor
try {
  db = Db()
  extractor = EntityExtractor()

  reporter.progress("Initializing database")
  await db.initialize()

  reporter.progress("Setting up page stream")
  const [{ count: totalPageCount }] = await db.query<{ count: number }>(
    `SELECT COUNT(id) FROM ${PAGES}`,
  )
  const pages = db.stream<Page>(`SELECT * FROM ${PAGES}`)
  let index = 1
  for await (let page of pages) {
    try {
      reporter.progress(
        `Processing page ${index}/${totalPageCount}: ${page.id} (${page.url})`,
      )
      const structuredData = parsePage(page)

      const { product, offers, category, tags, sellers, brand } =
        await extractor.extract(structuredData, page)

      await Promise.all(
        [
          [
            db.categories.create(category),
            db.traces.create(page.id, CATEGORIES.toString(), category.name)
          ],
          tags.map((tag) => [
            db.tags.create(tag),
            db.traces.create(page.id, TAGS.toString(), tag.name),
          ]),
          sellers.map((seller) => [
            db.sellers.create(seller),
            db.traces.create(page.id, SELLERS.toString(), seller.name),
          ]),
          brand ? [
            db.brands.create(brand),
            db.traces.create(page.id, BRANDS.toString(), brand.name),
          ] : Promise.resolve(),
        ].flat(Infinity),
      )

      await Promise.all([
        db.products.create(product),
        db.traces.create(page.id, PRODUCTS.toString(), product.id),
      ])
      await Promise.all(offers.map((offer) => db.offers.create(page.id, offer)))

      index += 1
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      reporter.error(`[${page.id} (${page.url})]: ${message}`)
    }
  }

  reporter.succeed(`Processed ${totalPageCount} pages`)
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  reporter.fail(`Fatal error: ${message}`)
} finally {
  await Promise.all([db?.close(), extractor?.close()])
}
