import "@testing-library/jest-dom/vitest"
import type { MockInstance } from "vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import pg from "pg"
import { load } from "./+page.server"
import page from "./+page.svelte"

vi.mock("pg")

describe("Product Detail page", () => {
	const PRODUCT = {
		id: "666",
		name: "Product name",
		description: "Shop the look!",
		images: ["https://example.com/product_image.jpg"],
		product_uri: "https://example.com/product.html",
		shop_name: "Example",
		similar: [],
	}

	let query: MockInstance
	beforeEach(() => {
		vi.resetAllMocks()
		cleanup()
		
		query = vi.fn()
		pg.Pool.mockReturnValue({
			query,
			end: vi.fn(),
		})
	})

	async function loadAndRender(data: any, sectionName: string) {
		query.mockResolvedValueOnce({ rows: [data] })

		render(page, {
			data: await load({ params: { productId: PRODUCT.id } } as any),
		} as any)
		const section = screen.getByRole("region", { name: sectionName })
		
		return within(section)
	}

	it("shows product's details", async () => {
		const section = await loadAndRender(PRODUCT, PRODUCT.name )
		
		const image = section.getByRole('img')
		const heading = section.getByRole("heading")
		const description = section.getByText(PRODUCT.description)
		const buyLink = section.getByRole("link")

		expect(image).toHaveAttribute("src", PRODUCT.images[0])
		expect(image).toHaveAccessibleName(PRODUCT.name)
		expect(heading).toHaveTextContent(PRODUCT.name)
		expect(description).toBeInTheDocument()
		expect(buyLink).toHaveAttribute("href", PRODUCT.product_uri)
		expect(buyLink).toHaveAccessibleName(expect.stringContaining(PRODUCT.shop_name))
	})

	it("shows similar products", async () => {
		const SIMILAR = {
			id: '000',
			name: 'Similar product',
			image: 'https://example.com/related_product.jpg',
		}
		const section = await loadAndRender({
			...PRODUCT,
			similar: [SIMILAR],
		}, "Productos similares")
		
		const heading = section.getByRole("heading")
		const title = section.getByText(SIMILAR.name)
		const image = section.getByRole('img')
		const buyLink = section.getByRole("link")

		expect(heading).toHaveTextContent("Productos similares")
		expect(title).toBeInTheDocument()
		expect(image).toHaveAttribute("src", SIMILAR.image)
		expect(buyLink).toHaveAttribute("href", expect.stringContaining(SIMILAR.id))
	})
})
