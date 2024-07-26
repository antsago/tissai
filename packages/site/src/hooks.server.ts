import type { Handle } from "@sveltejs/kit"
import { Db } from "@tissai/db"

let db: Db
export const handle: Handle = async ({ event, resolve }) => {
  if (!db) {
    db = Db()
  }
  event.locals.db = db
  return resolve(event)
}
