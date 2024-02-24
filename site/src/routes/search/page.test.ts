import "@testing-library/jest-dom/vitest"
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { QUERY, SIMILAR, Fake } from "mocks"
import { Products } from "$lib/server"
import { load } from "./+page.server"
import page from "./+page.svelte"

describe("Search page", () => {
	let fake: Fake
	beforeEach(() => {
		cleanup()

		fake = Fake()
	})

	it("shows search results", async () => {
		fake.query.mockResolvedValueOnce({ rows: [SIMILAR] })
	
		render(page, {
			data: await load({
				url: new URL(`http://localhost:3000/search?q=${QUERY}`),
				locals: { products: Products() },
			} as any),
		} as any)
	
		const results = screen.getByRole("region", { name: "Resultados de la búsqueda"})
		const title = within(results).getByRole("heading", { level: 3 })
		const image = within(results).getByRole("img")
		const detailLink = within(results).getByRole("link")

		expect(image).toHaveAttribute("src", SIMILAR.image)
		expect(image).toHaveAccessibleName(SIMILAR.name)
		expect(title).toHaveTextContent(SIMILAR.name)
		expect(detailLink).toHaveAttribute("href", expect.stringContaining(SIMILAR.id))
	})
})
