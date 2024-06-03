import type { Page } from "@sveltejs/kit"
import type { Readable, Subscriber } from "svelte/store"
import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, cleanup, within } from "@testing-library/svelte"
import * as stores from "$app/stores"
import { QUERY } from "mocks"
import page from "./+layout.svelte"

vi.mock("$app/stores", () => {
  let pageValue: Omit<Page, "state"> = {
    url: new URL("http://localhost:3000"),
    params: {},
    status: 200,
    error: null,
    data: {},
    route: {
      id: null,
    },
    form: undefined,
  }

  let subscription: Subscriber<Omit<Page, "state">> | undefined
  const setPage = (newValue: Partial<Page>) => {
    pageValue = {
      ...pageValue,
      ...newValue,
    }
    subscription?.(pageValue)
  }

  const pageStore: Readable<Omit<Page, "state">> = {
    subscribe: (subFn) => {
      subscription = subFn
      subscription(pageValue)

      return () => {
        subscription = undefined
      }
    },
  }

  return {
    page: pageStore,
    setPage,
  }
})

describe("Layout", () => {
  beforeEach(() => {
    cleanup()
  })

  it("shows header, main, and footer", async () => {
    ;(stores as any).setPage({
      url: new URL("http://localhost:3000/a-page"),
    })

    render(page)
    const header = screen.getByRole("banner")
    const main = screen.getByRole("main")
    const footer = screen.getByRole("contentinfo")

    expect(header).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(footer).toBeInTheDocument()
  })

  it("links to homepage", async () => {
    ;(stores as any).setPage({
      url: new URL("http://localhost:3000/a-page"),
    })

    render(page)
    const header = screen.getByRole("banner")
    const link = within(header).getByRole("link")

    expect(link).toHaveAttribute("href", "/")
  })

  it("shows search query when on search page", async () => {
    ;(stores as any).setPage({
      url: new URL(`http://localhost:3000/search?q=${QUERY}`),
    })

    render(page)
    const header = screen.getByRole("banner")
    const searchForm = within(header).getByRole("search")
    const searchInput = within(searchForm).getByRole("searchbox")

    expect(searchInput).toHaveValue(QUERY)
  })

  it("hides header on when on homepage", async () => {
    ;(stores as any).setPage({
      url: new URL("http://localhost:3000"),
    })

    render(page)
    const header = screen.queryByRole("banner", { hidden: true })

    expect(header).not.toBeInTheDocument()
  })
})
