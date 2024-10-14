import { describe, test, expect } from "vitest"
import { mockDbFixture, queries } from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { Tokenizer } from "@tissai/tokenizer"
import { SUGGESTION } from "mocks"
import { getSuggestions } from "./getSuggestions"

const it = test.extend<{ db: mockDbFixture }>({
  db: [mockDbFixture, { auto: true }],
})

describe("getSuggestions", () => {
  it("returns suggestions", async ({ db }) => {
    db.pool.query.mockResolvedValueOnce({
      rows: [SUGGESTION],
    })
    const locals = { db: Db(), tokenizer: Tokenizer() }

    const results = await getSuggestions(locals)

    expect(results).toStrictEqual([SUGGESTION])
    expect(db).toHaveExecuted(queries.suggestions.category())
  })

  it("filters meaningless words", async ({ db }) => {
    db.pool.query.mockResolvedValueOnce({
      rows: [SUGGESTION],
    })
    const locals = { db: Db(), tokenizer: Tokenizer() }

    const results = await getSuggestions(locals)

    expect(results).toStrictEqual([SUGGESTION])
    expect(db).toHaveExecuted(queries.suggestions.category())
  })

  it.for([{ values: null }, { values: [] }])(
    "filters empty suggestions",
    async ({ values }, { db }) => {
      db.pool.query.mockResolvedValueOnce({
        rows: [{ ...SUGGESTION, values }],
      })
      const locals = { db: Db(), tokenizer: Tokenizer() }

      const results = await getSuggestions(locals)

      expect(results).toStrictEqual([])
    },
  )
})
