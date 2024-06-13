import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, cleanup, within } from "@testing-library/svelte"
import * as stores from "$app/stores"
import { QUERY } from "mocks"
import page from "./+layout.svelte"

vi.mock("$app/stores", async () => (await import('mocks')).storesMock())

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

  it("hides header when on homepage", async () => {
    ;(stores as any).setPage({
      url: new URL("http://localhost:3000"),
    })

    render(page)
    const header = screen.queryByRole("banner", { hidden: true })

    expect(header).not.toBeInTheDocument()
  })
})
