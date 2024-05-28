import { expect, describe, it, beforeEach, vi } from "vitest"
import { MockPg } from "#mocks"
import { Db } from "./Db.js"

describe("Db", () => {
  let db: Db
  let pg: MockPg
  beforeEach(() => {
    pg = MockPg()
    db = Db()
  })

  it("initializes pool on create", async () => {
    expect(pg.Pool).toHaveBeenCalled()
  })

  it("executes query", async () => {
    const expected = [{ a: "row" }]
    const query = "A sql STATEMENT"
    const parameters = [1, 2]
    pg.query.mockResolvedValueOnce({ rows: expected })

    const result = await db.query(query, parameters)

    expect(result).toStrictEqual(expected)
    expect(pg.query).toHaveBeenCalledWith(query, parameters)
  })

  it("streams results", async () => {
    const expected = [{ row: 1 }, { row: 2 }]
    const query = "A sql STATEMENT"
    const parameters = [1, 2]
    const close = vi.fn()
    const read = vi.fn()
    const cursor = { close, read }
    pg.client.query.mockResolvedValueOnce(cursor)
    cursor.read.mockResolvedValueOnce([expected[0]])
    cursor.read.mockResolvedValueOnce([expected[1]])
    cursor.read.mockResolvedValueOnce([])

    const result: any[] = []
    const rows = db.stream<{ order: number }>(query, parameters)
    for await (let row of rows) {
      result.push(row)
    }
    
    expect(result).toStrictEqual(expected)
    expect(pg.Cursor).toHaveBeenCalledWith(query, parameters)
    expect(cursor.close).toHaveBeenCalled()
    expect(pg.client.release).toHaveBeenCalled()
  })
})
