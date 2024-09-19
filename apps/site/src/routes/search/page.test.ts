import "@testing-library/jest-dom/vitest"
import { describe, test, expect, afterEach, vi } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { MockPg, OFFER, mockDbFixture, queries } from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { MockPython, mockPythonFixture } from "@tissai/python-pool/mocks"
import { Tokenizer } from "@tissai/tokenizer"
import { QUERY, SIMILAR, BRAND, SUGGESTION } from "mocks"
import * as stores from "$app/stores"
import { load } from "./+page.server"
import page from "./+page.svelte"

vi.mock("$app/stores", async () => (await import("mocks")).storesMock())

const it = test.extend<{ db: mockDbFixture, python: mockPythonFixture }>({
  db: [mockDbFixture, { auto: true }],
  python: [mockPythonFixture, { auto: true }]
})

describe("Search page", () => {
  afterEach(() => {
    cleanup()
  })

  async function loadAndRender(
    db: MockPg,
    python: MockPython,
    { queryParams, sectionName = "Resultados de la búsqueda" } = {} as any,
  ) {
    db.pool.query.mockResolvedValueOnce({
      rows: [
            {
              ...SIMILAR,
              brand: BRAND,
              price: String(OFFER.price),
            },
            ...new Array(4).fill(null).map((_, i) => ({
              title: i,
              id: i,
              brand: BRAND,
              price: undefined,
            })),
      ],
    })
    db.pool.query.mockResolvedValueOnce({
      rows: [SUGGESTION],
    })
    python.mockReturnValue(SUGGESTION.values.map(v => ({ isMeaningful: true, text: SUGGESTION.values[0] })))

    const url = new URL(
      `http://localhost:3000/search?q=${QUERY}${queryParams ? `&${queryParams}` : ""}`,
    )
    ;(stores as any).setPage({
      url,
    })

    render(page, {
      data: await load({
        url,
        locals: { db: Db(), tokenizer: Tokenizer() },
      } as any),
    } as any)

    const results = screen.getByRole("region", { name: sectionName })

    return within(results)
  }

  it("displays search results", async ({ db, python }) => {
    const results = await loadAndRender(db, python)

    const product = results.getByRole("heading", {
      level: 3,
      name: SIMILAR.title,
    })
    const suggestion = results.getByRole("heading", {
      level: 3,
      name: SUGGESTION.label,
    })

    expect(product).toBeInTheDocument()
    expect(suggestion).toBeInTheDocument()
    expect(db).toHaveExecuted(queries.products.search({ query: QUERY }))
    expect(db).toHaveExecuted(queries.suggestions.category(SUGGESTION.values))
    expect(python.worker.send).toHaveBeenCalledWith(QUERY)
  })

  it("displays filters", async ({ db, python }) => {
    const results = await loadAndRender(db, python, {
      queryParams: `brand=${BRAND.name}`,
      sectionName: "Filtros",
    })

    const brandName = results.getByText(BRAND.name, { exact: false })

    expect(brandName).toBeInTheDocument()
    expect(db).toHaveExecuted(
      queries.products.search({ query: QUERY, brand: BRAND.name }),
    )
  })
})
