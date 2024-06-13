import "@testing-library/jest-dom/vitest"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { QUERY, SIMILAR, MockPg, MockPython, EMBEDDING, BRAND } from "mocks"
import * as stores from "$app/stores"
import { Products } from "$lib/server"
import { load } from "./+page.server"
import page from "./+page.svelte"

vi.mock("$app/stores", () => {
  let pageValue: Omit<Page, "state"> = {
    url: new URL("http://localhost:3000"),
    params: {},
    status: 200,
    error: null,
    data: {},
    route: {
      id: null,
    },
    form: undefined,
  }

  let subscription: Subscriber<Omit<Page, "state">> | undefined
  const setPage = (newValue: Partial<Page>) => {
    pageValue = {
      ...pageValue,
      ...newValue,
    }
    subscription?.(pageValue)
  }

  const pageStore: Readable<Omit<Page, "state">> = {
    subscribe: (subFn) => {
      subscription = subFn
      subscription(pageValue)

      return () => {
        subscription = undefined
      }
    },
  }

  return {
    page: pageStore,
    setPage,
  }
})

describe("Search page", () => {
  let pg: MockPg
  let python: MockPython
  beforeEach(() => {
    cleanup()

    pg = MockPg()
    python = MockPython()
  })

  async function loadAndRender({
    queryParams,
    sectionName = "Resultados de la búsqueda",
    ...overwrite
  } = {}) {
    pg.pool.query.mockResolvedValueOnce({ rows: [{
      ...SIMILAR,
      brand: [BRAND],
      ...overwrite,
    }] })
    python.mockReturnValue(EMBEDDING)

    const url = new URL(`http://localhost:3000/search?q=${QUERY}${queryParams ? `&${queryParams}` : ''}`)
    ;(stores as any).setPage({
      url,
    })

    render(page, {
      data: await load({
        url,
        locals: { products: Products() },
      } as any),
    } as any)

    const results = screen.getByRole("region", {name: sectionName
    })
    
    return within(results)
  }

  it("shows search results", async () => {
    const results = await loadAndRender()

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
  })

  it("handles brands without logo", async () => {
    const results = await loadAndRender({
      brand: [{
        name: BRAND.name,
      }],
    })

    const brandName = results.getByText(BRAND.name)
    const brandLogo = results.queryByRole("img", {
      name: `Logo de ${BRAND.name}`,
    })

    expect(brandName).toBeInTheDocument()
    expect(brandLogo).not.toBeInTheDocument()
  })

  it("handles products without brand", async () => {
    const results = await loadAndRender({
      brand: [null],
    })

    const undef = results.queryByText('undefined')
    const brandName = results.queryByText(BRAND.name)
    const brandLogo = results.queryByRole("img", {
      name: `Logo de ${BRAND.name}`,
    })

    expect(brandName).not.toBeInTheDocument()
    expect(brandLogo).not.toBeInTheDocument()
    expect(undef).not.toBeInTheDocument()
  })

  it("displays brand filters", async () => {
    const results = await loadAndRender({ queryParams: `brand=${BRAND.name}`, sectionName: "Filtros" })

    const brandName = results.getByText(BRAND.name)

    expect(brandName).toBeInTheDocument()
  })
})
