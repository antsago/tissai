import type { Db } from "@tissai/db"
import type { Tokenizer } from "@tissai/tokenizer"

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      db: Db
      tokenizer: Tokenizer
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {}
