import "@testing-library/jest-dom/vitest"
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { QUERY, SIMILAR, MockPg, MockPython, EMBEDDING, BRAND } from "mocks"
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
      ...SIMILAR,
      brand: [BRAND],
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
    const image = within(results).getByRole("img", { name: SIMILAR.title })
    const detailLink = within(results).getByRole("link")
    // const brandName = within(results).getByText(BRAND.name)
    const brand = within(results).getByRole("img", {
      name: `Logo de ${BRAND.name}`,
    })

    expect(image).toHaveAttribute("src", SIMILAR.image)
    expect(title).toHaveTextContent(SIMILAR.title)
    expect(brand).toBeInTheDocument()
    expect(detailLink).toHaveAttribute(
      "href",
      expect.stringContaining(SIMILAR.id),
    )
  })
})
