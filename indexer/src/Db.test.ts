import { expect, describe, it, beforeEach } from 'vitest'
import { MockPg } from '#mocks'
import { Db } from './Db.js'

describe('Db', () => {
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
})
