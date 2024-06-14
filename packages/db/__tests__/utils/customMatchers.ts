import type { MockPg } from "./MockPg.js"
import type { SearchParams } from "../../src/index.js"
import { expect } from "vitest"
import { PRODUCTS, formatEmbedding } from "../../src/index.js"

interface CustomMatchers {
  toHaveInserted: (table: string, values?: any[]) => void
  toHaveSearched: (searchParams: SearchParams) => void
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers {}
}

expect.extend({
  toHaveInserted(pg: MockPg, table, values = []) {
    const { isNot, equals } = this
    const expected = expect.arrayContaining([
      [
        expect.stringContaining(`INSERT INTO ${table}`),
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
  toHaveSearched(pg: MockPg, { embedding, brand, category }: SearchParams) {
    const { isNot, equals } = this
    const expected = expect.arrayContaining([
      [
        expect.stringMatching(
          new RegExp(`SELECT[\\s\\S]*FROM[\\s\\S]*${PRODUCTS}`),
        ),
        [formatEmbedding(embedding), brand, category].filter((p) => !!p),
      ],
    ])
    const actual = pg.pool.query.mock.calls
    return {
      pass: equals(actual, expected),
      message: () => (isNot ? `Found search` : `Expected search`),
      actual,
      expected,
    }
  },
})
