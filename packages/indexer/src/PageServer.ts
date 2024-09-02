import { Db, Page } from "@tissai/db"
import { reporter } from "./Reporter.js"
import { runForAllPages } from "./runForAllPages.js"

type OnInitialize<T> = () => T

export class PageServer<T = undefined> {
  getState?: OnInitialize<T>

  constructor(
    private onPage: (page: Page, state: T & { db: Db }) => Promise<any>,
    private onClose: (state: Partial<T>) => Promise<any>,
  ) {}

  onInitialize = (fn: OnInitialize<T>) => {
    this.getState = fn
    return this
  }

  start = async () => {
    let db: Db
    let state: T

    try {
      reporter.progress("Initializing...")

      db = Db()
      await db.initialize()
      if (this.getState) {
        state = this.getState()
      }

      await runForAllPages(db, (page) => this.onPage(page, { ...state, db }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      reporter.fail(`Fatal error: ${message}`)
    } finally {
      await Promise.all([db!?.close(), state! && this.onClose(state)])
    }
  }
}
