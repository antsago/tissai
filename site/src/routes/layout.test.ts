import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, within, cleanup, waitFor } from "@testing-library/svelte"
import userEvent from '@testing-library/user-event'
import page from "./+layout.svelte"

describe("Layout", () => {
	beforeEach(() => {
		cleanup()
	})

	it("shows header, main, and footer", async () => {
		render(page)

		const header = screen.getByRole("banner")
		const main = screen.getByRole("main")
		const footer = screen.getByRole("contentinfo")

		expect(header).toBeInTheDocument()
		expect(main).toBeInTheDocument()
		expect(footer).toBeInTheDocument()
	})
	
	it("handles search submissions", async () => {
		const user = userEvent.setup()
		let submission
		const onSubmit = vi.fn((e) => {
			e.preventDefault()
			submission = {
				values: [...(new FormData(e.target)).entries()].reduce((o, [k, v]) => ({ ...o, [k]: v }), {}),
				method: e.target.method,
				action: e.target.action.replace('http://localhost:3000', ''),
			}
		})
		render(page, { props: { onSubmit, }})
		const searchForm = screen.getByRole("search")
		const searchInput = within(searchForm).getByRole("searchbox")
		const submitButton = within(searchForm).getByRole("button")

		await user.type(searchInput, 'A query')
		await user.click(submitButton)

		expect(submission).toStrictEqual({
			values: { q: 'A query'},
			method: "get",
			action: "/search"
		})
	})
})
