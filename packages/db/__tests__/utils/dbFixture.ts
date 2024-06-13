import { randomUUID } from "node:crypto"
import { test } from "vitest"
import { Db } from "../../src/index.js"

type Fixture<T> = Parameters<typeof test.extend<{ db: T }>>[0]["db"]

export const dbFixture: Fixture<Db> = async ({}, use) => {
  const masterDb = Db()
  const TEST_TABLE = randomUUID()
  await masterDb.query(`CREATE DATABASE "${TEST_TABLE}";`)
  const db = Db(TEST_TABLE)
  await db.initialize()

  await use(db)

  await db.close()
  await masterDb.query(`DROP DATABASE "${TEST_TABLE}";`)
  await masterDb.close()
}

export type dbFixture = Db
