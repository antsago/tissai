import type { MockInstance } from "vitest"
import { vi, describe, it, expect, beforeEach } from "vitest"
import pg from "pg"
import { DB } from "./db"

const QUERY = "A query"

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
		const SIMILAR = {
			id: "000",
			name: "Similar product",
			image: "https://example.com/related_product.jpg",
		}
		query.mockResolvedValueOnce({ rows: [SIMILAR] })

		const result = await db.query(QUERY)

		expect(result).toStrictEqual([SIMILAR])
		expect(query).toHaveBeenCalledWith(QUERY)
	})
})
