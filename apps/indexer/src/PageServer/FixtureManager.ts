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
  const close = {} as { compiler?: CloseFixture; db?: CloseFixture }

  return {
    init: async (reporter: Reporter) => {
      const fixtures = { db: dbFixture, compiler: compilerFixture }

      return Object.fromEntries(
        await Promise.all(
          Object.entries(fixtures).map(async ([name, initializer]) => {
            const [helper, closer] = await initializer(reporter)
            close[name as "db" | "compiler"] = closer

            return [name, helper]
          }),
        ),
      )
    },
    close: () => Promise.all(Object.values(close).map((c) => c())),
  }
}

export type FixtureManager<T> = ReturnType<typeof FixtureManager<T>>
