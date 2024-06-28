import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import {
  BRANDS,
  CATEGORIES,
  Db,
  OFFERS,
  Page,
  PAGES,
  PRODUCTS,
  SELLERS,
  TAGS,
} from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import { reporter } from "./Reporter.js"
import parsedPage from "./parsedPage.js"
import jsonLd from "./jsonLd.js"
import opengraph from "./opengraph.js"
import headings from "./headings.js"
import title from "./EntityExtractor/title.js"
import category from "./EntityExtractor/category.js"
import tags from "./EntityExtractor/tags.js"
import sellers from "./EntityExtractor/sellers.js"
import brand from "./EntityExtractor/brand.js"
import product from "./EntityExtractor/product.js"
import offers from "./EntityExtractor/offers.js"

let db!: Db
let python!: PythonPool<
  { method: "category" | "embedding" | "tags"; input: string },
  { embedding: number[] } & { category: string } & { tags: string[] }
>
try {
  const currentDirectory = dirname(fileURLToPath(import.meta.url))
  db = Db()
  python = PythonPool(
    `${currentDirectory}/EntityExtractor/parseTitle.py`,
    reporter,
  )

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
      const root = parsedPage(page)

      const jsonLdInfo = jsonLd(root)
      const opengraphInfo = opengraph(root)
      const headingInfo = headings(root)

      const productTitle = title(jsonLdInfo, opengraphInfo, headingInfo)

      if (!productTitle) {
        throw new Error("Product without title!")
      }

      const categoryEntity = await category(productTitle, python)
      const tagEntities = await tags(productTitle, python)
      const sellerEntities = sellers(jsonLdInfo)
      const brandEntity = brand(jsonLdInfo)
      const productEntity = await product(
        jsonLdInfo,
        headingInfo,
        opengraphInfo,
        productTitle,
        python,
        categoryEntity,
        tagEntities,
        brandEntity,
      )
      const offerEntities = offers(jsonLdInfo, page, productEntity)

      await Promise.all(
        [
          [
            db.categories.create(categoryEntity),
            db.traces.create(
              page.id,
              CATEGORIES.toString(),
              categoryEntity.name,
            ),
          ],
          tagEntities.map((tag) => [
            db.tags.create(tag),
            db.traces.create(page.id, TAGS.toString(), tag.name),
          ]),
          sellerEntities.map((seller) => [
            db.sellers.create(seller),
            db.traces.create(page.id, SELLERS.toString(), seller.name),
          ]),
          brandEntity
            ? [
                db.brands.create(brandEntity),
                db.traces.create(page.id, BRANDS.toString(), brandEntity.name),
              ]
            : Promise.resolve(),
        ].flat(Infinity),
      )

      await Promise.all([
        db.products.create(productEntity),
        db.traces.create(page.id, PRODUCTS.toString(), productEntity.id),
      ])
      await Promise.all(
        offerEntities
          .map((offer) => [
            db.offers.create(offer),
            db.traces.create(page.id, OFFERS.toString(), offer.id),
          ])
          .flat(),
      )

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
  await Promise.all([db?.close(), python?.close()])
}
