import { describe, test, expect } from "vitest"
import { CATEGORY_NODE, mockDbFixture, queries } from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { SUGGESTION } from "mocks"
import { getSuggestions } from "./getSuggestions"

const it = test.extend<{ db: mockDbFixture }>({
  db: [mockDbFixture, { auto: true }],
})

describe("getSuggestions", () => {
  it("returns category suggestions", async ({ db }) => {
    db.pool.query.mockResolvedValueOnce({
      rows: [SUGGESTION],
    })

    const results = await getSuggestions({}, Db())

    expect(results).toStrictEqual([SUGGESTION])
    expect(db).toHaveExecuted(queries.suggestions.category())
  })

  it.for([{ values: null }, { values: [] }])(
    "filters empty category suggestions",
    async ({ values }, { db }) => {
      db.pool.query.mockResolvedValueOnce({
        rows: [{ ...SUGGESTION, values }],
      })

      const results = await getSuggestions({}, Db())

      expect(results).toStrictEqual([])
    },
  )

  it("returns attribute suggestions with category filter", async ({ db }) => {
    const category = { id: CATEGORY_NODE.id, name: CATEGORY_NODE.name }
    db.pool.query.mockResolvedValueOnce({
      rows: [SUGGESTION],
    })

    const results = await getSuggestions({ category }, Db())

    expect(results).toStrictEqual([SUGGESTION])
    expect(db).toHaveExecuted(queries.suggestions.attributes(category.id))
  })
})
