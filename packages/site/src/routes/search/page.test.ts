import "@testing-library/jest-dom/vitest"
import { describe, test, expect, afterEach, vi } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { CATEGORY, MockPg, OFFER, TAG, mockDbFixture } from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { QUERY, SIMILAR, BRAND } from "mocks"
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
          ...SIMILAR,
          brand: [BRAND],
          price: String(OFFER.price),
          ...overwrite,
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

  it("shows search results", async ({ db }) => {
    const results = await loadAndRender(db)

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
    expect(db).toHaveSearched({ query: QUERY })
  })

  it("handles brands without logo", async ({ db }) => {
    const results = await loadAndRender(db, {
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

  it("handles products without brand", async ({ db }) => {
    const results = await loadAndRender(db, {
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

  it("handles products without price", async ({ db }) => {
    const results = await loadAndRender(db, {
      price: undefined,
    })

    const undef = results.queryByText("undefined")
    const price = results.queryByText(OFFER.price)

    expect(price).not.toBeInTheDocument()
    expect(undef).not.toBeInTheDocument()
  })

  it("displays brands filter", async ({ db }) => {
    const results = await loadAndRender(db, {
      queryParams: `brand=${BRAND.name}`,
      sectionName: "Filtros",
    })

    const brandName = results.getByText(BRAND.name, { exact: false })

    expect(brandName).toBeInTheDocument()
    expect(db).toHaveSearched({ query: QUERY, brand: BRAND.name })
  })

  it("displays price filters", async ({ db }) => {
    const min = 11.1
    const max = 22.2
    const results = await loadAndRender(db, {
      queryParams: `min=${min}&max=${max}`,
      sectionName: "Filtros",
    })

    const minFilter = results.getByText(min, { exact: false })
    const maxFilter = results.getByText(max, { exact: false })

    expect(minFilter).toBeInTheDocument()
    expect(maxFilter).toBeInTheDocument()
    expect(db).toHaveSearched({ query: QUERY, min, max })
  })

  it("displays min price filter only", async ({ db }) => {
    const min = 11.1
    const results = await loadAndRender(db, {
      queryParams: `min=${min}`,
      sectionName: "Filtros",
    })

    const minFilter = results.getByText(min, { exact: false })

    expect(minFilter).toBeInTheDocument()
  })

  it("displays max price filter only", async ({ db }) => {
    const max = 22.2
    const results = await loadAndRender(db, {
      queryParams: `max=${max}`,
      sectionName: "Filtros",
    })

    const maxFilter = results.getByText(max, { exact: false })

    expect(maxFilter).toBeInTheDocument()
  })

  it("displays categories filter", async ({ db }) => {
    const results = await loadAndRender(db, {
      queryParams: `category=${CATEGORY.name}`,
      sectionName: "Filtros",
    })

    const categoryName = results.getByText(CATEGORY.name, { exact: false })

    expect(categoryName).toBeInTheDocument()
    expect(db).toHaveSearched({ query: QUERY, category: CATEGORY.name })
  })

  it("displays tags filter", async ({ db }) => {
    const results = await loadAndRender(db, {
      queryParams: `inc=${TAG.name}`,
      sectionName: "Filtros",
    })

    const tagName = results.getByText(TAG.name)

    expect(tagName).toBeInTheDocument()
    expect(db).toHaveSearched({ query: QUERY, tags: [TAG.name] })
  })

  it("supports multiple tags filter", async ({ db }) => {
    const tag2 = "myTag"
    const results = await loadAndRender(db, {
      queryParams: `inc=${TAG.name}&inc=${tag2}`,
      sectionName: "Filtros",
    })

    const tagName = results.getByText(TAG.name)
    const tag2Name = results.getByText(tag2)

    expect(tagName).toBeInTheDocument()
    expect(tag2Name).toBeInTheDocument()
    expect(db).toHaveSearched({ query: QUERY, tags: [TAG.name, tag2] })
  })

  it("handles filterless search", async ({ db }) => {
    const results = await loadAndRender(db, {
      sectionName: "Filtros",
    })

    const undef = results.queryByText(new RegExp("undefined|null"))

    expect(undef).not.toBeInTheDocument()
  })
})
