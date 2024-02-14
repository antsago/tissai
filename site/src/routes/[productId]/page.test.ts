import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/svelte"
import pg from "pg"
import { load } from "./+page.server"
import page from "./+page.svelte"

vi.mock("pg")

describe("Product Detail page", () => {
	it("shows product's details", async () => {
		const PRODUCT = {
			id: "666",
			name: "Product name",
			description: "Shop the look!",
			images: ["https://example.com/product_image.jpg"],
			product_uri: "https://example.com/product.html",
			shop_name: "Example",
			shop_icon: "https://example.com/favicon.png",
		}
		pg.Pool.mockReturnValue({
			query: vi.fn().mockResolvedValueOnce({ rows: [PRODUCT] }),
			end: vi.fn(),
		})

		render(page, {
			data: await load({ params: { productId: PRODUCT.id } } as any),
		} as any)

		const image = screen.getByAltText(PRODUCT.name)
		const heading = screen.getByRole("heading")
		const description = screen.getByRole("main")
		const buyLink = screen.getByRole("link", {
			name: (n) => n.includes(PRODUCT.shop_name),
		})

		expect(image).toHaveAttribute("src", PRODUCT.images[0])
		expect(heading).toHaveTextContent(PRODUCT.name)
		expect(description).toHaveTextContent(PRODUCT.description)
		expect(buyLink).toHaveAttribute("href", PRODUCT.product_uri)
	})
})
