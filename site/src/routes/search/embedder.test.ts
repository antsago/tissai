import { describe, it, expect, beforeEach } from "vitest"
import Embedder from "./embedder"

describe("Embedder", () => {
	let embedder: Embedder
	beforeEach(() => {
		embedder = Embedder()
	})

	it("returns embeddings", async () => {
		const query = 'A query'

		const result = await embedder.embed(query)

		expect(result).toEqual(`Hello ${query}`)
	})

	it("supports simultaneous queries", async () => {
		const query1 = 'Query 1'
		const query2 = 'Query 2'

		const promise1 = embedder.embed(query1)
		const promise2 = embedder.embed(query2)
		const result2 = await promise2
		const result1 = await promise1

		expect(result1).toEqual(`Hello ${query1}`)
		expect(result2).toEqual(`Hello ${query2}`)
	})
})
