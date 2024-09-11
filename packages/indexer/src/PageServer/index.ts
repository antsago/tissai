import { Db, Page } from "@tissai/db"
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
        [state, onClose] = this.fixture({ reporter })
      }

      const processedPages = await runForAllPages(async (page) => {
        if (this.processPage) {
          await this.processPage(page, { ...state, db })
        }
      }, { db, reporter })

      reporter.succeed(`Processed ${processedPages} pages`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      reporter.fail(`Fatal error: ${message}`)
    } finally {
      await Promise.all([
        db!?.close(),
        onClose && onClose(),
      ])
    }
  }
}
