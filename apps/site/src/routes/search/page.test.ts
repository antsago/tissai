import "@testing-library/jest-dom/vitest"
import { describe, test, expect, afterEach, vi } from "vitest"
import { render, screen, cleanup } from "@testing-library/svelte"
import { OFFER, mockDbFixture, queries, BRAND, PRODUCT } from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { Tokenizer } from "@tissai/tokenizer"
import { SUGGESTION } from "mocks"
import * as stores from "$app/stores"
import { load } from "./+page.server"
import page from "./+page.svelte"

vi.mock("$app/stores", async () => (await import("mocks")).storesMock())

const it = test.extend<{ db: mockDbFixture; python: mockPythonFixture }>({
  db: mockDbFixture,
  python: mockPythonFixture,
})

describe("Search page", () => {
  afterEach(() => {
    cleanup()
  })

  const SEARCH_RESULT = {
    id: PRODUCT.id,
    title: PRODUCT.title,
    image: PRODUCT.images[0],
    brand: BRAND,
    price: OFFER.price,
  }

  it("performs search", async ({ db, python }) => {
    python.mockReturnValue([])
    db.pool.query.mockResolvedValueOnce({ rows: [] })
    db.pool.query.mockResolvedValueOnce({ rows: [SEARCH_RESULT] })
    db.pool.query.mockResolvedValueOnce({ rows: [SUGGESTION] })
    const url = new URL(
      `http://localhost:3000/search?q=${PRODUCT.title}&brand=${BRAND.name}`,
    )

    const result = await load({
      url,
      locals: { db: Db(), tokenizer: Tokenizer() },
    } as any)

    expect(result).toStrictEqual({
      filters: {
        brand: BRAND.name,
      },
      tiles: [SUGGESTION, SEARCH_RESULT],
    })
  })

  it("handles empty queries", async ({ db }) => {
    db.pool.query.mockResolvedValueOnce({ rows: [SEARCH_RESULT] })
    db.pool.query.mockResolvedValueOnce({ rows: [SUGGESTION] })
    const url = new URL(`http://localhost:3000/search?brand=${BRAND.name}`)

    const result = await load({
      url,
      locals: { db: Db(), tokenizer: Tokenizer() },
    } as any)

    expect(result).toStrictEqual({
      filters: {
        brand: BRAND.name,
      },
      tiles: [SUGGESTION, SEARCH_RESULT],
    })
    expect(db).toHaveExecuted(
      queries.products.search("", { brand: BRAND.name }),
    )
  })

  it("renders", async ({ db }) => {
    db.pool.query.mockResolvedValueOnce({ rows: [SEARCH_RESULT] })
    db.pool.query.mockResolvedValueOnce({ rows: [SUGGESTION] })
    const url = new URL(`http://localhost:3000/search?brand=${BRAND.name}`)
    ;(stores as any).setPage({ url })

    render(page, {
      data: await load({
        url,
        locals: { db: Db(), tokenizer: Tokenizer() },
      } as any),
    } as any)

    const brandName = screen.getByText(BRAND.name, { exact: false })
    const product = screen.getByRole("heading", {
      level: 3,
      name: PRODUCT.title,
    })
    const suggestion = screen.getByRole("heading", {
      level: 3,
      name: `Filtrar por ${SUGGESTION.label}`,
    })

    expect(brandName).toBeInTheDocument()
    expect(product).toBeInTheDocument()
    expect(suggestion).toBeInTheDocument()
  })
})
