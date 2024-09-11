import { Db } from "@tissai/db"
import { Reporter } from "./Reporter.js"

type OptionalPromise<T> = Promise<T> | T
export type Fixture<T> = (reporter: Reporter) => OptionalPromise<[T, () => {}]>

const dbFixture: Fixture<Db> = async () => {
  const db = Db()
  await db.initialize()

  return [db, () => db.close()] as const
}

export function FixtureManager<T>(compilerFixture: Fixture<T>) {
  let closeDb: Awaited<ReturnType<typeof dbFixture>>[1]
  let closeCompiler: Awaited<ReturnType<Fixture<T>>>[1]

  return {
    init: async (reporter: Reporter) => {
      let db, compiler
      ;[db, closeDb] = await dbFixture(reporter)
      ;[compiler, closeCompiler] = await compilerFixture(reporter)

      return { db, compiler }
    },
    close: () => Promise.all([closeDb && closeDb(), closeCompiler && closeCompiler()]),
  }
}
