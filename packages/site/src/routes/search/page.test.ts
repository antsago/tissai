import "@testing-library/jest-dom/vitest"
import { describe, test, expect, afterEach, vi } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { MockPg, OFFER, mockDbFixture } from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { QUERY, SIMILAR, BRAND, SUGGESTION } from "mocks"
import * as stores from "$app/stores"
import { load } from "./+page.server"
import page from "./+page.svelte"

vi.mock("$app/stores", async () => (await import("mocks")).storesMock())

const it = test.extend<{ db: mockDbFixture }>({
  db: [mockDbFixture, { auto: true }],
})

describe("Search page", () => {
  afterEach(() => {
    cleanup()
  })

  async function loadAndRender(
    db: MockPg,
    {
      queryParams,
      sectionName = "Resultados de la búsqueda",
      ...overwrite
    } = {} as any,
  ) {
    db.pool.query.mockResolvedValueOnce({
      rows: [
        {
          products: [
            {
              ...SIMILAR,
              brand: BRAND,
              price: String(OFFER.price),
              ...overwrite,
            },
          ],
          suggestions: [SUGGESTION],
        },
      ],
    })

    const url = new URL(
      `http://localhost:3000/search?q=${QUERY}${queryParams ? `&${queryParams}` : ""}`,
    )
    ;(stores as any).setPage({
      url,
    })

    render(page, {
      data: await load({
        url,
        locals: { db: Db() },
      } as any),
    } as any)

    const results = screen.getByRole("region", { name: sectionName })

    return within(results)
  }

  it("displays search results", async ({ db }) => {
    const results = await loadAndRender(db)

    const product = results.getByRole("heading", { level: 3, name: SIMILAR.title })
    const suggestion = results.getByRole("heading", { level: 3, name: SUGGESTION.label })

    expect(product).toBeInTheDocument()
    expect(suggestion).toBeInTheDocument()
    expect(db).toHaveSearched({ query: QUERY })
  })

  it("displays filters", async ({ db }) => {
    const results = await loadAndRender(db, {
      queryParams: `brand=${BRAND.name}`,
      sectionName: "Filtros",
    })

    const brandName = results.getByText(BRAND.name, { exact: false })

    expect(brandName).toBeInTheDocument()
    expect(db).toHaveSearched({ query: QUERY, brand: BRAND.name })
  })
})
