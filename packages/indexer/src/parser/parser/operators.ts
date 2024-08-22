import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"
import Context from "./Context.js"

type Rule<T> = (reader: TokenReader<Token>) => T

export const any =
  <T>(check: Rule<T>) =>
  (reader: TokenReader<Token>) => {
    const results = [] as NonNullable<T>[]

    while (reader.hasNext()) {
      reader.savePosition()

      const result = check(reader)
      if (!result) {
        reader.restoreSave()
        break
      }

      results.push(result)
      reader.discardSave()
    }

    return results
  }

type RuleResult<T extends Rule<unknown>> =
  T extends Rule<infer I> ? NonNullable<I> : never

type AndResult<T extends Rule<unknown>[]> = {
  [K in keyof T]: RuleResult<T[K]>
}
export const and =
  <T extends Rule<unknown>[]>(...checks: T) =>
  (reader: TokenReader<Token>) => {
    const result = [] as AndResult<T>

    for (const check of checks) {
      const match = check(reader)
      if (!match) {
        return null
      }

      result.push(match)
    }

    return result
  }

export const or =
  <T extends Rule<unknown>[]>(...checks: T) =>
  (reader: TokenReader<Token>) => {
    for (const check of checks) {
      reader.savePosition()

      const match = check(reader) as RuleResult<T[number]>
      if (match) {
        reader.discardSave()
        return match
      }

      reader.restoreSave()
    }

    return null
  }

export const withL =
  <T>(checkFactory: (l: Context) => Rule<T>) =>
  (reader: TokenReader<Token>) => {
    const context = new Context()

    const check = checkFactory(context)

    const result = check(reader)

    return { result, context }
  }

export const MatchToken =
  (check: (nextToken: Token) => boolean) => (reader: TokenReader<Token>) => {
    const nextToken = reader.get()
    if (nextToken && check(nextToken)) {
      reader.next()
      return nextToken
    }

    return null
  }
