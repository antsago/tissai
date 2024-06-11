import "@testing-library/jest-dom/vitest"
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { QUERY, SIMILAR, MockPg, MockPython, EMBEDDING } from "mocks"
import { Products } from "$lib/server"
import { load } from "./+page.server"
import page from "./+page.svelte"

describe("Search page", () => {
  let pg: MockPg
  let python: MockPython
  beforeEach(() => {
    cleanup()

    pg = MockPg()
    python = MockPython()
  })

  it("shows search results", async () => {
    pg.pool.query.mockResolvedValueOnce({ rows: [{
      id: SIMILAR.id,
      name: SIMILAR.title,
      image: SIMILAR.image,
    }] })
    python.mockReturnValue(EMBEDDING)

    render(page, {
      data: await load({
        url: new URL(`http://localhost:3000/search?q=${QUERY}`),
        locals: { products: Products() },
      } as any),
    } as any)

    const results = screen.getByRole("region", {
      name: "Resultados de la búsqueda",
    })
    const title = within(results).getByRole("heading", { level: 3 })
    const image = within(results).getByRole("img")
    const detailLink = within(results).getByRole("link")

    expect(image).toHaveAttribute("src", SIMILAR.image)
    expect(image).toHaveAccessibleName(SIMILAR.title)
    expect(title).toHaveTextContent(SIMILAR.title)
    expect(detailLink).toHaveAttribute(
      "href",
      expect.stringContaining(SIMILAR.id),
    )
  })
})
