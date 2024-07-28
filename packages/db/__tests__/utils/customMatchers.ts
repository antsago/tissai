import type { MockPg } from "./MockPg.js"
import type { SearchParams } from "../../src/index.js"
import { expect } from "vitest"
import { buildSearchQuery } from "../../src/searchProducts.js"

export interface CustomMatchers {
  toHaveInserted: (table: string, values?: any[]) => void
  toHaveSearched: (searchParams: SearchParams) => void
  toHaveExecuted: (query: string, parameters?: readonly unknown[]) => void
}

declare module "vitest" {
  interface Assertion extends CustomMatchers {}
}

function toHaveExecuted(
  pg: MockPg,
  query: string,
  parameters?: readonly unknown[],
) {
  const { isNot, equals } = this
  const expected = expect.arrayContaining([[query, parameters]])
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
  toHaveInserted(pg: MockPg, table: string, values = []) {
    return toHaveExecuted.call(
      this,
      pg,
      expect.stringMatching(new RegExp(`INSERT INTO (\\")?${table}`, "i")),
      expect.arrayContaining(values),
    )
  },
  toHaveSearched(pg: MockPg, parameters: SearchParams) {
    const query = buildSearchQuery(parameters)
    return toHaveExecuted.call(this, pg, query.sql, query.parameters)
  },
})
