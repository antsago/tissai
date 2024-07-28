import type { MockPg } from "./MockPg.js"
import type { SearchParams } from "../../src/index.js"
import { expect } from "vitest"
import { buildSearchQuery } from "../../src/searchProducts.js"

export interface CustomMatchers {
  toHaveInserted: (table: string, values?: any[]) => void
  toHaveSearched: (searchParams: SearchParams) => void
}

declare module "vitest" {
  interface Assertion extends CustomMatchers {}
}

expect.extend({
  toHaveInserted(pg: MockPg, table, values = []) {
    const { isNot, equals } = this
    const expected = expect.arrayContaining([
      [
        expect.stringMatching(new RegExp(`INSERT INTO (\\")?${table}`, "i")),
        expect.arrayContaining(values),
      ],
    ])
    const actual = pg.pool.query.mock.calls
    return {
      pass: equals(actual, expected),
      message: () =>
        isNot
          ? `Found insertion into "${table}"`
          : `Expected insertion into "${table}"`,
      actual,
      expected,
    }
  },
  toHaveSearched(pg: MockPg, parameters: SearchParams) {
    const { isNot, equals } = this
    const query = buildSearchQuery(parameters)
    const expected = expect.arrayContaining([[query.sql, query.parameters]])
    const actual = pg.pool.query.mock.calls
    return {
      pass: equals(actual, expected),
      message: () =>
        isNot ? `Found unwanted search` : `Expected search not found`,
      actual,
      expected,
    }
  },
})
