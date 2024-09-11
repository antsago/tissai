import { type Page, Db, query } from "@tissai/db"
import { type Reporter } from "./Reporter.js"

export const runForAllPages = async (
  onPage: (page: Page) => Promise<void>,
  { db, reporter }: { db: Db, reporter: Reporter },
) => {
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

      await onPage(page)

      index += 1
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      reporter.error(`[${page.id} (${page.url})]: ${message}`)
    }
  }

  return index
}
