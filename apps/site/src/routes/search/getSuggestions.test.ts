import { describe, test, expect } from "vitest"
import { mockDbFixture, queries } from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { Tokenizer } from "@tissai/tokenizer"
import { QUERY, SUGGESTION } from "mocks"
import { getSuggestions } from "./getSuggestions"

const it = test.extend<{ db: mockDbFixture, python: mockPythonFixture }>({
  db: [mockDbFixture, { auto: true }],
  python: [mockPythonFixture, { auto: true }]
})

describe("getSuggestions", () => {
  it("returns suggestions", async ({ db, python }) => {
    python.mockReturnValue(SUGGESTION.values.map(v => ({ isMeaningful: true, text: SUGGESTION.values[0] })))
    db.pool.query.mockResolvedValueOnce({
      rows: [SUGGESTION],
    })
    const locals = { db: Db(), tokenizer: Tokenizer() }

    const results = await getSuggestions(QUERY, locals)

    expect(results).toStrictEqual([SUGGESTION])
    expect(python.worker.send).toHaveBeenCalledWith(QUERY)
    expect(db).toHaveExecuted(queries.suggestions.category(SUGGESTION.values))
  })

  it("filters meaningless words", async ({ db, python }) => {
    python.mockReturnValue([...SUGGESTION.values.map(v => ({ isMeaningful: true, text: SUGGESTION.values[0] })), { isMeaningfull: false, text: "foo" }])
    db.pool.query.mockResolvedValueOnce({
      rows: [SUGGESTION],
    })
    const locals = { db: Db(), tokenizer: Tokenizer() }

    const results = await getSuggestions(QUERY, locals)

    expect(results).toStrictEqual([SUGGESTION])
    expect(python.worker.send).toHaveBeenCalledWith(QUERY)
    expect(db).toHaveExecuted(queries.suggestions.category(SUGGESTION.values))
  })

  it.for([{ values: null }, { values: []}])("filters empty suggestions", async ({ values }, { db, python }) => {
    python.mockReturnValue([...SUGGESTION.values.map(v => ({ isMeaningful: true, text: SUGGESTION.values[0] })), { isMeaningfull: false, text: "foo" }])
    db.pool.query.mockResolvedValueOnce({
      rows: [{...SUGGESTION, values}],
    })
    const locals = { db: Db(), tokenizer: Tokenizer() }

    const results = await getSuggestions(QUERY, locals)

    expect(results).toStrictEqual([])
  })
})
