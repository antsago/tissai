import type { CompiledQuery } from "kysely"
import type { QueryResultRow } from "pg"
import type { MockPg } from "./MockPg.js"
import { expect } from "vitest"

export interface CustomMatchers {
  toHaveExecuted: <T extends QueryResultRow>(query: CompiledQuery<T>) => void
}

declare module "vitest" {
  interface Assertion extends CustomMatchers {}
}

expect.extend({
  toHaveExecuted<T extends QueryResultRow>(
    pg: MockPg,
    query: CompiledQuery<T>,
  ) {
    const expected = expect.arrayContaining([[query.sql, query.parameters]])
    const actual = pg.pool.query.mock.calls
    return {
      pass: this.equals(actual, expected),
      message: () =>
        this.isNot ? `Found unwanted query` : `Expected query not found`,
      actual,
      expected,
    }
  },
})
