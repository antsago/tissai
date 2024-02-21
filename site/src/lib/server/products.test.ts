import type { MockInstance } from "vitest"
import { vi, describe, it, expect, beforeEach } from "vitest"
import pg from "pg"
import { SIMILAR, QUERY, EMBEDDING } from 'mocks'
import { Products } from "./products"

vi.mock("pg")

describe("Products", () => {
	let query: MockInstance
	let products: Products
	beforeEach(() => {
		query = vi.fn()
		pg.Pool.mockReturnValue({
			query,
			end: vi.fn(),
		})

		products = Products()
	})

	it("returns searched products", async () => {
		query.mockResolvedValueOnce({ rows: [SIMILAR] })

		const result = await products.search(QUERY)

		expect(result).toStrictEqual([SIMILAR])
		expect(query).toHaveBeenCalledWith(expect.stringContaining(`ORDER BY embedding <-> '[${EMBEDDING}]`))
	})

})
