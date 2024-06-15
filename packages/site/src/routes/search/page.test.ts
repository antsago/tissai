import "@testing-library/jest-dom/vitest"
import { describe, test, expect, afterEach, vi } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { CATEGORY, MockPg, OFFER, mockDbFixture } from "@tissai/db/mocks"
import { MockPython, mockPythonFixture } from "@tissai/python-pool/mocks"
import { QUERY, SIMILAR, EMBEDDING, BRAND } from "mocks"
import * as stores from "$app/stores"
import { Products } from "$lib/server"
import { load } from "./+page.server"
import page from "./+page.svelte"

vi.mock("$app/stores", async () => (await import("mocks")).storesMock())

const it = test.extend<{ db: mockDbFixture; python: mockPythonFixture }>({
  db: [mockDbFixture, { auto: true }],
  python: [mockPythonFixture as any, { auto: true }],
})

describe("Search page", () => {
  afterEach(() => {
    cleanup()
  })

  async function loadAndRender(
    db: MockPg,
    python: MockPython,
    {
      queryParams,
      sectionName = "Resultados de la búsqueda",
      ...overwrite
    } = {} as any,
  ) {
    db.pool.query.mockResolvedValueOnce({
      rows: [
        {
          ...SIMILAR,
          brand: [BRAND],
          price: String(OFFER.price),
          ...overwrite,
        },
      ],
    })
    python.mockReturnValue(EMBEDDING)

    const url = new URL(
      `http://localhost:3000/search?q=${QUERY}${queryParams ? `&${queryParams}` : ""}`,
    )
    ;(stores as any).setPage({
      url,
    })

    render(page, {
      data: await load({
        url,
        locals: { products: Products() },
      } as any),
    } as any)

    const results = screen.getByRole("region", { name: sectionName })

    return within(results)
  }

  it("shows search results", async ({ db, python }) => {
    const results = await loadAndRender(db, python)

    const title = results.getByRole("heading", { level: 3 })
    const image = results.getByRole("img", { name: SIMILAR.title })
    const detailLink = results.getByRole("link")
    const price = results.getByText(OFFER.price)
    const brandName = results.queryByText(BRAND.name)
    const brandLogo = results.getByRole("img", {
      name: `Logo de ${BRAND.name}`,
    })

    expect(image).toHaveAttribute("src", SIMILAR.image)
    expect(title).toHaveTextContent(SIMILAR.title)
    expect(price).toBeInTheDocument()
    expect(brandLogo).toBeInTheDocument()
    expect(brandName).not.toBeInTheDocument()
    expect(detailLink).toHaveAttribute(
      "href",
      expect.stringContaining(SIMILAR.id),
    )
    expect(db).toHaveSearched({ embedding: EMBEDDING })
  })

  it("handles brands without logo", async ({ db, python }) => {
    const results = await loadAndRender(db, python, {
      brand: [
        {
          name: BRAND.name,
        },
      ],
    })

    const brandName = results.getByText(BRAND.name)
    const brandLogo = results.queryByRole("img", {
      name: `Logo de ${BRAND.name}`,
    })

    expect(brandName).toBeInTheDocument()
    expect(brandLogo).not.toBeInTheDocument()
  })

  it("handles products without brand", async ({ db, python }) => {
    const results = await loadAndRender(db, python, {
      brand: [null],
    })

    const undef = results.queryByText("undefined")
    const brandName = results.queryByText(BRAND.name)
    const brandLogo = results.queryByRole("img", {
      name: `Logo de ${BRAND.name}`,
    })

    expect(brandName).not.toBeInTheDocument()
    expect(brandLogo).not.toBeInTheDocument()
    expect(undef).not.toBeInTheDocument()
  })

  it("handles products without price", async ({ db, python }) => {
    const results = await loadAndRender(db, python, {
      price: undefined,
    })

    const undef = results.queryByText("undefined")
    const price = results.queryByText(OFFER.price)

    expect(price).not.toBeInTheDocument()
    expect(undef).not.toBeInTheDocument()
  })

  it("displays brands filter", async ({ db, python }) => {
    const results = await loadAndRender(db, python, {
      queryParams: `brand=${BRAND.name}`,
      sectionName: "Filtros",
    })

    const brandName = results.getByText(BRAND.name)

    expect(brandName).toBeInTheDocument()
    expect(db).toHaveSearched({ embedding: EMBEDDING, brand: BRAND.name })
  })

  it("displays price filters", async ({ db, python }) => {
    const min = 11.1
    const max = 22.2
    const results = await loadAndRender(db, python, {
      queryParams: `min=${min}&max=${max}`,
      sectionName: "Filtros",
    })

    const minFilter = results.getByText(min)
    const maxFilter = results.getByText(max)

    expect(minFilter).toBeInTheDocument()
    expect(maxFilter).toBeInTheDocument()
    expect(db).toHaveSearched({ embedding: EMBEDDING, min, max })
  })

  it("displays categories filter", async ({ db, python }) => {
    const results = await loadAndRender(db, python, {
      queryParams: `category=${CATEGORY.name}`,
      sectionName: "Filtros",
    })

    const categoryName = results.getByText(CATEGORY.name)

    expect(categoryName).toBeInTheDocument()
    expect(db).toHaveSearched({ embedding: EMBEDDING, category: CATEGORY.name })
  })

  it("handles filterless search", async ({ db, python }) => {
    const results = await loadAndRender(db, python, {
      sectionName: "Filtros",
    })

    const undef = results.queryByText(new RegExp("^undefined|null$"))

    expect(undef).not.toBeInTheDocument()
  })
})
