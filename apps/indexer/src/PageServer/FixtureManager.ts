import { type Db } from "@tissai/db"
import { Reporter } from "./Reporter.js"

export type OptionalPromise<T> = Promise<T> | T
type CloseFixture = () => OptionalPromise<unknown>
export type Fixture<T> = (
  reporter: Reporter,
) => OptionalPromise<readonly [T, CloseFixture]>

export function FixtureManager<T>(
  compilerFixture: Fixture<T>,
  dbFixture: Fixture<Db>,
) {
  let closeDb: CloseFixture
  let closeCompiler: CloseFixture

  return {
    init: async (reporter: Reporter) => {
      let db, compiler
      ;[db, closeDb] = await dbFixture(reporter)
      ;[compiler, closeCompiler] = await compilerFixture(reporter)

      return { db, compiler }
    },
    close: () =>
      Promise.all([closeDb && closeDb(), closeCompiler && closeCompiler()]),
  }
}
