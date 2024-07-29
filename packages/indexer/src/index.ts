import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { type Page, Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import { reporter } from "./Reporter.js"
import parsedPage from "./parsedPage.js"
import jsonLd from "./jsonLd.js"
import opengraph from "./opengraph.js"
import headings from "./headings.js"
import title from "./EntityExtractor/title.js"
import seller from "./EntityExtractor/seller.js"
import brand from "./EntityExtractor/brand.js"
import product from "./EntityExtractor/product.js"
import offer from "./EntityExtractor/offer.js"
import normalizedOffers from "./EntityExtractor/normalizedOffers.js"
import attributes, {
  type PythonAttribute,
} from "./EntityExtractor/attributes.js"

let db!: Db
let python!: PythonPool<
  { method: "attributes"; input: string },
  {
    attributes: PythonAttribute[]
  }
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
  const [{ count: totalPageCount }] = await db.query(
    query
      .selectFrom("pages")
      .select(({ fn }) => fn.count("id").as("count"))
      .compile(),
  )
  const pages = db.stream<Page>(query.selectFrom("pages").selectAll().compile())
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

      const brandEntity = await brand(jsonLdInfo, db)
      const productEntity = await product(
        jsonLdInfo,
        headingInfo,
        opengraphInfo,
        productTitle,
        db,
        brandEntity,
      )
      await Promise.all(
        normalizedOffers(jsonLdInfo).map(async (o) => {
          const sellerEntity = await seller(o, db)
          await offer(o, sellerEntity, page, productEntity, db)
        }),
      )
      await attributes(productEntity, python, db)

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
