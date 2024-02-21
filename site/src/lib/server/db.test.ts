import type { MockInstance } from "vitest"
import { vi, describe, it, expect, beforeEach } from "vitest"
import pg from "pg"
import { QUERY, SIMILAR } from 'mocks'
import { DB } from "./db"

vi.mock("pg")

describe("DB", () => {
	let query: MockInstance
	let db: DB
	beforeEach(() => {
		query = vi.fn()
		pg.Pool.mockReturnValue({
			query,
			end: vi.fn(),
		})

		db = DB()
	})

	it("executes query", async () => {
		query.mockResolvedValueOnce({ rows: [SIMILAR] })

		const result = await db.query(QUERY)

		expect(result).toStrictEqual([SIMILAR])
		expect(query).toHaveBeenCalledWith(QUERY)
	})
})
