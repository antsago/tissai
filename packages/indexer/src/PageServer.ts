import { Db, Page } from "@tissai/db"
import { reporter } from "./Reporter.js"
import { runForAllPages } from "./runForAllPages.js"

type OnInitialize<T> = () => T
type OnPage<T> = (page: Page, state: T & { db: Db }) => Promise<any>
type OnClose<T> = (state: Partial<T>) => Promise<any>

export class PageServer<T> {
  private getState?: OnInitialize<T>
  private processPage?: OnPage<T>
  private closeState?: OnClose<T>

  onInitialize = (fn: OnInitialize<T>) => {
    this.getState = fn
    return this
  }
  onPage = (fn: OnPage<T>) => {
    this.processPage = fn
    return this
  }
  onClose = (fn: OnClose<T>) => {
    this.closeState = fn
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

      await runForAllPages(db, async (page) => {
        if (this.processPage) {
          await this.processPage(page, { ...state, db })
        }
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      reporter.fail(`Fatal error: ${message}`)
    } finally {
      await Promise.all([
        db!?.close(),
        this.closeState && this.closeState(state! ?? {}),
      ])
    }
  }
}
