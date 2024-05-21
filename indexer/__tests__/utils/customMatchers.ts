import { expect } from "vitest"
import type { MockPg } from "./MockPg.js"

interface CustomMatchers {
  toHaveInserted: (table: string, values: any[]) => void
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers {}
}

expect.extend({
  toHaveInserted(pg: MockPg, table, values) {
    const { isNot, equals } = this
    const expected = expect.arrayContaining([[expect.stringContaining(`INSERT INTO ${table}`), expect.arrayContaining(values)]])
    const actual = pg.query.mock.calls
    return {
      pass: equals(actual, expected),
      message: () => isNot ? `Found insertion into "${table}"` : `Expected insertion into "${table}"`,
      actual,
      expected, 
    }
  }
})
