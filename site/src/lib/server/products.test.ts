import { describe, it, expect, beforeEach } from "vitest"
import { PRODUCT, SIMILAR, QUERY, EMBEDDING, Fake } from "mocks"
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
		expect(fake.query).toHaveBeenCalledWith(
			expect.stringContaining(`ORDER BY embedding <-> '[${EMBEDDING}]`),
		)
	})

	it("returns product details", async () => {
		const expected = {
			...PRODUCT,
			similar: [SIMILAR],
		}
		fake.query.mockResolvedValueOnce({ rows: [expected] })

		const result = await products.getDetails(PRODUCT.id)

		expect(result).toStrictEqual(expected)
		expect(fake.query).toHaveBeenCalledWith(expect.stringContaining(PRODUCT.id))
		expect(fake.query).toHaveBeenCalledWith(
			expect.stringContaining("ORDER BY p2.embedding"),
		)
	})
})
