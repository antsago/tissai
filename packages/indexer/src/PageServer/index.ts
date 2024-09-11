import { Db, Page, query } from "@tissai/db"
import { Reporter } from "./Reporter.js"
import { runForAllPages } from "./runForAllPages.js"

type OnPage<T> = (page: Page, state: T & { db: Db }) => Promise<any>
type Fixture<T> = (state: { reporter: Reporter }) => [T, () => {}]

export class PageServer<T> {
  private processPage?: OnPage<T>
  private fixture?: Fixture<T>

  extend = (fix: Fixture<T>) => {
    this.fixture = fix
    return this
  }
  onPage = (fn: OnPage<T>) => {
    this.processPage = fn
    return this
  }

  start = async () => {
    let db: Db
    let state: T
    let onClose
    const reporter = Reporter()

    try {
      reporter.progress("Initializing...")

      db = Db()
      await db.initialize()
      if (this.fixture) {
        ;[state, onClose] = this.fixture({ reporter })
      }

      const baseQuery = query.selectFrom("pages")
      const [{ total }] = await db.query(
        baseQuery.select(({ fn }) => fn.count("id").as("total")).compile(),
      )
      const pages = db.stream<Page>(baseQuery.selectAll().compile())

      const processedPages = await runForAllPages(
        pages,
        async (page, index) => {
          reporter.progress(
            `Processing page ${index}/${total}: ${page.id} (${page.url})`,
          )

          if (this.processPage) {
            await this.processPage(page, { ...state, db })
          }
        },
        (err, page) => {
          const message = err instanceof Error ? err.message : String(err)
          reporter.error(`[${page.id} (${page.url})]: ${message}`)
        },
      )

      reporter.succeed(`Processed ${processedPages} pages`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      reporter.fail(`Fatal error: ${message}`)
    } finally {
      await Promise.all([db!?.close(), onClose && onClose()])
    }
  }
}
