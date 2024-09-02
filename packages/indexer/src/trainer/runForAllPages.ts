import { type Page, Db, query } from "@tissai/db"
import { reporter } from "../Reporter.js"

export const runForAllPages = async (db: Db, onPage: (page: Page) => Promise<void>) => {
  reporter.progress("Setting up page stream")

  const [{ count: totalPageCount }] = await db.query(
    query
      .selectFrom("pages")
      .select(({ fn }) => fn.count("id").as("count"))
      .compile(),
  )
  const pages = db.stream<Page>(query.selectFrom("pages").selectAll().limit(2).compile())

  let index = 1
  for await (let page of pages) {
    try {
      reporter.progress(
        `Processing page ${index}/${totalPageCount}: ${page.id} (${page.url})`,
      )

      await onPage(page)

      index += 1
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      reporter.error(`[${page.id} (${page.url})]: ${message}`)
    }
  }

  reporter.succeed(`Processed ${totalPageCount} pages`)
}
