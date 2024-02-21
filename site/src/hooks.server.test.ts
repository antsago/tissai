import type { Handle } from "./$types"
import type { Products } from "$lib/server"
import { describe, it, expect, vi, expectTypeOf, beforeEach } from "vitest"

describe("Server hooks", () => {
	const resolve = vi.fn()
	const event: any = { locals: {} }
	
	let handle: Handle
	beforeEach(async () => {
		vi.resetModules()
		
		const hooks = await import("./hooks.server")
		handle = hooks.handle
	})
	
	
	it("initializes products", async () => {
		const expected = "The result"
		resolve.mockResolvedValue(expected)

		const result = await handle({ event, resolve })

		expect(result).toStrictEqual(expected)
		expect(resolve).toHaveBeenCalledWith(event)
		expectTypeOf(event.locals.products).toEqualTypeOf<Products>()
	})

	it("reuses initialized products", async () => {
		const event2: any = { locals: {} }
		await handle({ event, resolve })
		await handle({ event: event2, resolve })

		expect(event.locals.products).toBe(event2.locals.products)
	})
})
