import { describe, it, expect, beforeEach } from "vitest"
import { SIMILAR, QUERY, EMBEDDING, Fake } from 'mocks'
import { Products } from "./products"

describe("Products", () => {
	let fake: Fake
	let products: Products
	beforeEach(() => {
		fake = Fake()

		products = Products()
	})

	it("returns searched products", async () => {
		fake.query.mockResolvedValueOnce({ rows: [SIMILAR] })

		const result = await products.search(QUERY)

		expect(result).toStrictEqual([SIMILAR])
		expect(fake.query).toHaveBeenCalledWith(expect.stringContaining(`ORDER BY embedding <-> '[${EMBEDDING}]`))
	})
})
