import { describe, it, expect, beforeEach } from "vitest"
import { QUERY, SIMILAR, Fake } from 'mocks'
import { DB } from "./db"

describe("DB", () => {
	let db: DB
	let fake: Fake
	beforeEach(() => {
		fake = Fake()

		db = DB()
	})

	it("executes query", async () => {
		fake.query.mockResolvedValueOnce({ rows: [SIMILAR] })

		const result = await db.query(QUERY)

		expect(result).toStrictEqual([SIMILAR])
		expect(fake.query).toHaveBeenCalledWith(QUERY)
	})
})
