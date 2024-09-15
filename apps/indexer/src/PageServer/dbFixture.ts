import { Db } from "@tissai/db"
import { type Fixture } from "./FixtureManager.js"

export const dbFixture: Fixture<Db> = async () => {
  const db = Db()
  await db.initialize()

  return [db, () => db.close()] as const
}
