import "@testing-library/jest-dom/vitest"
import { describe, test, expect, afterEach, vi } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { MockPg, mockDbFixture } from "@tissai/db/mocks"
import { MockPython, mockPythonFixture } from "@tissai/python-pool/mocks"
import { QUERY, SIMILAR, EMBEDDING, BRAND } from "mocks"
import * as stores from "$app/stores"
import { Products } from "$lib/server"
import { load } from "./+page.server"
import page from "./+page.svelte"
import { PRODUCTS, type Product } from "@tissai/db"

vi.mock("$app/stores", async () => (await import("mocks")).storesMock())

type SearchParams = {
  embedding: Product["embedding"]
  brand?: Product["brand"]
}

interface CustomMatchers {
  toHaveSearched: (searchParams: SearchParams) => void
}
declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers {}
}

expect.extend({
  toHaveSearched(pg: MockPg, { embedding, brand }: SearchParams) {
    const { isNot, equals } = this
    const expected = expect.arrayContaining([
      [
        expect.stringMatching(
          new RegExp(`SELECT[\\s\\S]*FROM[\\s\\S]*${PRODUCTS}`),
        ),
        [`[${embedding.join(",")}]`, brand].filter((p) => !!p),
      ],
    ])
    const actual = pg.pool.query.mock.calls
    return {
      pass: equals(actual, expected),
      message: () => (isNot ? `Found search` : `Expected search`),
      actual,
      expected,
    }
  },
})

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
    const brandName = results.queryByText(BRAND.name)
    const brandLogo = results.getByRole("img", {
      name: `Logo de ${BRAND.name}`,
    })

    expect(image).toHaveAttribute("src", SIMILAR.image)
    expect(title).toHaveTextContent(SIMILAR.title)
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

  it("displays brands filter", async ({ db, python }) => {
    const results = await loadAndRender(db, python, {
      queryParams: `brand=${BRAND.name}`,
      sectionName: "Filtros",
    })

    const brandName = results.getByText(BRAND.name)

    expect(brandName).toBeInTheDocument()
    expect(db).toHaveSearched({ embedding: EMBEDDING, brand: BRAND.name })
  })

  it("handles filterless search", async ({ db, python }) => {
    const results = await loadAndRender(db, python, {
      sectionName: "Filtros",
    })

    const undef = results.queryByText(new RegExp("^undefined|null$"))

    expect(undef).not.toBeInTheDocument()
  })
})
