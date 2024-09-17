import type { Handle } from "@sveltejs/kit"
import { Db } from "@tissai/db"
import { Tokenizer } from "@tissai/tokenizer"

let db: Db
let tokenizer: Tokenizer
export const handle: Handle = async ({ event, resolve }) => {
  if (!db) {
    db = Db()
  }
  if (!tokenizer) {
    tokenizer = Tokenizer()
  }
  event.locals.db = db
  event.locals.tokenizer = tokenizer
  return resolve(event)
}
