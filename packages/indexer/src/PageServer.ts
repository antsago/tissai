import { Db, Page } from "@tissai/db"
import { reporter } from "./Reporter.js"
import { runForAllPages } from "./runForAllPages.js"

type OnInitialize<T> = () => T

export class PageServer<T = undefined> {
  getState?: OnInitialize<T>

  constructor(
    private onInitialize: OnInitialize<T>,
    private onPage: (page: Page, state: T & { db: Db }) => Promise<any>,
    private onClose: (state: Partial<T>) => Promise<any>,
  ) {}

  start = async () => {
    let db: Db
    let state: T
  
    try {
      reporter.progress("Initializing...")
  
      db = Db()
      await db.initialize()
      state = await this.onInitialize()
  
      await runForAllPages(db, (page) => this.onPage(page, { ...state, db }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      reporter.fail(`Fatal error: ${message}`)
    } finally {
      await Promise.all([db!?.close(), state! && this.onClose(state)])
    }
  }
}
