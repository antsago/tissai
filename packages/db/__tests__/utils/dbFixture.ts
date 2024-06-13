import { randomUUID } from "node:crypto"
import { TaskContext, TestContext } from "vitest"
import { Db } from "../../src/index.js"

export type dbFixture = Db & { name: string } 

export const dbFixture = async ({}: TaskContext & TestContext, use: (db: dbFixture) => any) => {
  const masterDb = Db()
  const TEST_DB = randomUUID()
  await masterDb.query(`CREATE DATABASE "${TEST_DB}";`)
  const db = Db(TEST_DB)
  await db.initialize()

  await use({ name: TEST_DB, ...db })

  await db.close()
  await masterDb.query(`DROP DATABASE "${TEST_DB}";`)
  await masterDb.close()
}

