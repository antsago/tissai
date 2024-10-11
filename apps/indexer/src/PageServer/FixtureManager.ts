import { type Reporter } from "./Reporter.js"

export type OptionalPromise<T> = Promise<T> | T
type Closer = () => OptionalPromise<any>
export type Fixture<T> = (
  reporter: Reporter,
) => OptionalPromise<readonly [T, Closer]>
export type ToFixtures<T> = { [K in keyof T]: Fixture<T[K]> }

export function FixtureManager<T extends Record<string, unknown>>(
  fixtures: ToFixtures<T>,
) {
  const closers = {} as {
    [K in keyof T]: Closer
  }

  return {
    init: async (reporter: Reporter) => {
      return Object.fromEntries(
        await Promise.all(
          Object.entries(fixtures).map(async ([name, initializer]) => {
            const [helper, closer] = await initializer(reporter)
            closers[name as keyof T] = closer

            return [name, helper]
          }),
        ),
      ) as T
    },
    close: () => Promise.all(Object.values(closers).map((c) => c())),
  }
}

export type FixtureManager<T extends Record<string, unknown>> = ReturnType<
  typeof FixtureManager<T>
>
