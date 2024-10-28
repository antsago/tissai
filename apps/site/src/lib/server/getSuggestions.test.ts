import { describe, test, expect } from "vitest"
import { CATEGORY_NODE, mockDbFixture, queries, VALUE_NODE } from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { SUGGESTION } from "mocks"
import { getSuggestions } from "./getSuggestions"

const it = test.extend<{ db: mockDbFixture }>({
  db: [mockDbFixture, { auto: true }],
})

describe("getSuggestions", () => {
  const query = "thequery"
  const category = { id: CATEGORY_NODE.id, name: CATEGORY_NODE.name }

  it("returns category suggestions", async ({ db }) => {
    db.pool.query.mockResolvedValueOnce({
      rows: [SUGGESTION],
    })

    const results = await getSuggestions(query, {}, Db())

    expect(results).toStrictEqual([{
      label: SUGGESTION.label,
      values: [{
        name: VALUE_NODE.name,
        href: `/search?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(VALUE_NODE.id)}`
      }]
    }])
    expect(db).toHaveExecuted(queries.suggestions.category())
  })

  it.for([{ values: null }, { values: [] }])(
    "filters empty category suggestions",
    async ({ values }, { db }) => {
      db.pool.query.mockResolvedValueOnce({
        rows: [{ ...SUGGESTION, values }],
      })

      const results = await getSuggestions(query, {}, Db())

      expect(results).toStrictEqual([])
    },
  )

  it.for([{ values: null }, { values: [] }])(
    "filters empty attribute suggestions",
    async ({ values }, { db }) => {
      db.pool.query.mockResolvedValueOnce({
        rows: [{ ...SUGGESTION, values }],
      })

      const results = await getSuggestions(query, { category }, Db())

      expect(results).toStrictEqual([])
    },
  )

  it("returns attribute suggestions with category filter", async ({ db }) => {
    db.pool.query.mockResolvedValueOnce({
      rows: [SUGGESTION],
    })

    const results = await getSuggestions(query, { category }, Db())

    expect(results).toStrictEqual([{
      label: SUGGESTION.label,
      values: [{
        name: VALUE_NODE.name,
        href: `/search?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(category.id)}&att=${encodeURIComponent(VALUE_NODE.id)}`
      }]
    }])
    expect(db).toHaveExecuted(queries.suggestions.attributes(category.id))
  })
})
