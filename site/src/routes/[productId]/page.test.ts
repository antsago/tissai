import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/svelte"
import products from "../../../../data/products.json"
import { load } from "./+page.server"
import page from "./+page.svelte"

vi.mock("../../../../data/products.json", () => ({
	default: [
		{
			id: "666",
			name: "Product name",
			description: "Shop the look!",
			image: "https://example.com/product_image.jpg",
			sellers: [
				{
					productUrl: "https://example.com/product.html",
					shop: {
						name: "Example",
						image: "https://example.com/favicon.png",
					},
				},
			],
		},
	],
}))

describe("Product Detail page", () => {
	it("shows product's details", async () => {
		const PRODUCT = products[0]

		render(page, {
			data: await load({ params: { productId: PRODUCT.id } } as any),
		} as any)

		const image = screen.getByAltText(PRODUCT.name)
		const heading = screen.getByRole("heading")
		const description = screen.getByRole("main")
		const buyLink = screen.getByRole("link", {
			name: (n) => n.includes(PRODUCT.sellers[0].shop.name),
		})

		expect(image).toHaveAttribute("src", PRODUCT.image)
		expect(heading).toHaveTextContent(PRODUCT.name)
		expect(description).toHaveTextContent(PRODUCT.description)
		expect(buyLink).toHaveAttribute("href", PRODUCT.sellers[0].productUrl)
	})
})
