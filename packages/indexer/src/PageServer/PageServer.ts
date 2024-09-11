import { Db, Page, query } from "@tissai/db"
import { Reporter } from "./Reporter.js"
import { runStream } from "./runStream.js"

type OnPage<T> = (page: Page, state: { compiler: T, db: Db }) => Promise<any>
type Fixture<T> = (reporter: Reporter) => [T, () => {}]

export class PageServer<T> {
  private processPage?: OnPage<T>
  private compilerFixture?: Fixture<T>

  extend = (fix: Fixture<T>) => {
    this.compilerFixture = fix
    return this
  }
  onPage = (fn: OnPage<T>) => {
    this.processPage = fn
    return this
  }

  start = async () => {
    let db: Db
    let compiler: T
    let closeFixture
    const reporter = Reporter()

    try {
      reporter.progress("Initializing...")

      db = Db()
      await db.initialize()
      if (this.compilerFixture) {
        ;[compiler, closeFixture] = this.compilerFixture(reporter)
      }

      const baseQuery = query.selectFrom("pages")
      const [{ total }] = await db.query(
        baseQuery.select(({ fn }) => fn.count("id").as("total")).compile(),
      )
      const pages = db.stream<Page>(baseQuery.selectAll().compile())

      const processedPages = await runStream(
        pages,
        async (page, index) => {
          reporter.progress(
            `Processing page ${index}/${total}: ${page.id} (${page.url})`,
          )

          if (this.processPage) {
            await this.processPage(page, { compiler, db })
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
      await Promise.all([db!?.close(), closeFixture && closeFixture()])
    }
  }
}
