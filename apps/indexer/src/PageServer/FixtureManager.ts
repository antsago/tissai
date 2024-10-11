import { type Db } from "@tissai/db"
import { type Reporter } from "./Reporter.js"

export type OptionalPromise<T> = Promise<T> | T
type CloseFixture = () => OptionalPromise<unknown>
export type Fixture<T> = (
  reporter: Reporter,
) => OptionalPromise<readonly [T, CloseFixture]>

export function FixtureManager<T>(
  compilerFixture: Fixture<T>,
  dbFixture: Fixture<Db>,
) {
  // const close = {} as { compiler?: CloseFixture, db?: CloseFixture }
  let closeDb: CloseFixture
  let closeCompiler: CloseFixture

  return {
    init: async (reporter: Reporter) => {
      let db, compiler
      ;[db, closeDb] = await dbFixture(reporter)
      ;[compiler, closeCompiler] = await compilerFixture(reporter)

      // close.db = closeDb
      // close.compiler = closeCompiler

      return { db, compiler }
    },
    close: () =>
      Promise.all([closeDb && closeDb(), closeCompiler && closeCompiler()]),
  }
}

export type FixtureManager<T> = ReturnType<typeof FixtureManager<T>>
