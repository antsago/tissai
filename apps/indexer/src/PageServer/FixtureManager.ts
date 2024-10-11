import { type Reporter } from "./Reporter.js"

export type OptionalPromise<T> = Promise<T> | T
type Closer = () => OptionalPromise<void>
export type Fixture<T> = (
  reporter: Reporter,
) => OptionalPromise<readonly [T, Closer]>
type FixtureDefinition<T> = Record<string, Fixture<T>>

export function FixtureManager<T extends FixtureDefinition<unknown>>(fixtures: T) {
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
      ) as { [K in keyof T]: Awaited<ReturnType<T[K]>>[0]}
    },
    close: () => Promise.all(Object.values(closers).map((c) => c())),
  }
}

export type FixtureManager<T extends FixtureDefinition<unknown>> = ReturnType<typeof FixtureManager<T>>
