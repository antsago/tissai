import { expect, describe, it, beforeEach } from 'vitest'
import { FakePg } from '#mocks'
import { Db } from './Db.js'

describe('Db', () => {
  let db: Db
  let fakePg: FakePg
  beforeEach(() => {
    fakePg = FakePg()
    db = Db()
  })

	it("initializes pool on create", async () => {
		expect(fakePg.Pool).toHaveBeenCalled()
	})

	it("executes query", async () => {
    const expected = [{ a: "row" }]
    const query = "A sql STATEMEN"
		fakePg.query.mockResolvedValueOnce({ rows: expected })

		const result = await db.query(query)

		expect(result).toStrictEqual(expected)
		expect(fakePg.query).toHaveBeenCalledWith(query)
	})
})
