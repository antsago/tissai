import { Db, Page } from "@tissai/db"
import { reporter } from "../Reporter.js"
import { runForAllPages } from "./runForAllPages.js"

export async function PageServer<T>(
  onInitialize: () => T,
  onPage: (page: Page, state: T & { db: Db }) => Promise<any>,
  onClose: (state: Partial<T>) => Promise<any>,
) {
  let db: Db
  let state: T
  
  try {
    reporter.progress("Initializing...")

    db = Db()
    await db.initialize()
    state = await onInitialize()
  
    await runForAllPages(db, (page) => onPage(page, { ...state, db }))
  
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    reporter.fail(`Fatal error: ${message}`)
  } finally {
    await Promise.all([
      db!?.close(),
      state! && onClose(state)
    ])
  }
}
