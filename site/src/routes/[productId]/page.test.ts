import "@testing-library/jest-dom/vitest"
import type { MockInstance } from "vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, within } from "@testing-library/svelte"
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
		shop_icon: "https://example.com/favicon.png",
		similar: [],
	}

	let query: MockInstance
	beforeEach(() => {
		vi.resetAllMocks()
		
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
		expect(buyLink).toHaveAccessibleName(new RegExp(PRODUCT.shop_name))
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
		
		const image = section.getByRole('img')
		const heading = section.getByRole("heading")
		const buyLink = section.getByRole("link")

		expect(image).toHaveAttribute("src", PRODUCT.images[0])
		expect(heading).toHaveTextContent(PRODUCT.name)
		expect(buyLink).toHaveAttribute("href", new RegExp(SIMILAR.id))
	})
})
