import type { Db } from "@tissai/db"

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      db: Db
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {}
