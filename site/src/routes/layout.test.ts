import "@testing-library/jest-dom/vitest"
import { type Readable, type Subscriber } from 'svelte/store'
import type { Page } from '@sveltejs/kit'
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import userEvent from '@testing-library/user-event'
import * as stores from '$app/stores'
import { QUERY } from "mocks"
import page from "./+layout.svelte"

vi.mock('$app/stores', () => {
	let pageValue: Omit<Page, "state"> = {
		url: new URL("http://localhost:3000"),
		params: {},
		status: 200,
		error: null,
		data: {},
		route: {
			id: null
		},
		form: undefined
	}

	let subscription: Subscriber<Omit<Page, "state">> | undefined
	const setPage = (newValue: Partial<Page>) => {
		pageValue = {
			...pageValue,
			...newValue,
		}
		subscription?.(pageValue)
	}

  const page: Readable<Omit<Page, "state">>	= {
		subscribe: (subFn) => {
			subscription = subFn
			subscription(pageValue)

			return () =>  { subscription = undefined }
		}
	}

  return {
    page,
		setPage
  }
})

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
		render(page, { props: { onSubmit }})
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

	it("shows query when on search page", async () => {
		(stores as any).setPage({
			url: new URL(`http://localhost:3000/search?q=${QUERY}`),
		})
		
		render(page)
		const searchForm = screen.getByRole("search")
		const searchInput = within(searchForm).getByRole("searchbox")
		

		expect(searchInput).toHaveValue(QUERY)
	})
})
