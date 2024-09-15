import "@testing-library/jest-dom/vitest"
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/svelte"
import page from "./+page.svelte"

describe("Home page", () => {
  beforeEach(() => {
    cleanup()
  })

  it("shows logo and search", async () => {
    render(page)
    const title = screen.getByRole("heading", { level: 1 })
    const searchForm = screen.getByRole("search")

    expect(title).toHaveTextContent("Tissai")
    expect(searchForm).toBeInTheDocument()
  })
})
