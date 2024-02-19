import "@testing-library/jest-dom/vitest"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/svelte"
import page from "./+layout.svelte"

describe("Layout", () => {
	it("shows header, main, and footer", async () => {
		render(page)

		const header = screen.getByRole("banner")
		const main = screen.getByRole("main")
		const footer = screen.getByRole("contentinfo")

		expect(header).toBeInTheDocument()
		expect(main).toBeInTheDocument()
		expect(footer).toBeInTheDocument()
	})
})
