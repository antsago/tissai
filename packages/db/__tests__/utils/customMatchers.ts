import type { CompiledQuery } from "kysely"
import type { QueryResultRow } from "pg"
import type { MockPg } from "./MockPg.js"
import type { SearchParams } from "../../src/index.js"
import { expect } from "vitest"
import searchProducts from "../../src/queries/searchProducts.js"

export interface CustomMatchers {
  toHaveSearched: (searchParams: SearchParams) => void
  toHaveExecuted: <T extends QueryResultRow>(query: CompiledQuery<T>) => void
}

declare module "vitest" {
  interface Assertion extends CustomMatchers {}
}

function toHaveExecuted<T extends QueryResultRow>(
  pg: MockPg,
  query: CompiledQuery<T>,
) {
  const { isNot, equals } = this
  const expected = expect.arrayContaining([[query.sql, query.parameters]])
  const actual = pg.pool.query.mock.calls
  return {
    pass: equals(actual, expected),
    message: () =>
      isNot ? `Found unwanted query` : `Expected query not found`,
    actual,
    expected,
  }
}

expect.extend({
  toHaveExecuted,
  toHaveSearched(pg: MockPg, parameters: SearchParams) {
    const query = searchProducts.query(parameters)
    return toHaveExecuted.call(this, pg, query)
  },
})
