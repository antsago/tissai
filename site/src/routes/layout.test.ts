import type { Page } from '@sveltejs/kit'
import type { Readable, Subscriber } from 'svelte/store'
import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/svelte"
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
})
