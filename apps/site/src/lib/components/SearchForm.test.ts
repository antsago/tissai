import "@testing-library/jest-dom/vitest"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import userEvent from "@testing-library/user-event"
import { PRODUCT } from "mocks"
import SearchForm from "./SearchForm.svelte"

describe("SearchForm", () => {
  beforeEach(() => {
    cleanup()
  })

  it("handles search submissions", async () => {
    const user = userEvent.setup()
    let submission
    const onSubmit = vi.fn((e) => {
      e.preventDefault()
      submission = {
        values: [...new FormData(e.target).entries()].reduce(
          (o, [k, v]) => ({ ...o, [k]: v }),
          {},
        ),
        method: e.target.method,
        action: e.target.action.replace("http://localhost:3000", ""),
      }
    })
    render(SearchForm, { props: { onSubmit } })
    const searchForm = screen.getByRole("search")
    const searchInput = within(searchForm).getByRole("searchbox")
    const submitButton = within(searchForm).getByRole("button")

    await user.type(searchInput, "A query")
    await user.click(submitButton)

    expect(submission).toStrictEqual({
      values: { q: "A query" },
      method: "get",
      action: "/search",
    })
  })

  it("defaults to empty initial value", async () => {
    render(SearchForm)
    const searchForm = screen.getByRole("search")
    const searchInput = within(searchForm).getByRole("searchbox")

    expect(searchInput).toHaveValue("")
  })

  it("displays initial value if passed", async () => {
    render(SearchForm, { initialValue: PRODUCT.title })
    const searchForm = screen.getByRole("search")
    const searchInput = within(searchForm).getByRole("searchbox")

    expect(searchInput).toHaveValue(PRODUCT.title)
  })
})
