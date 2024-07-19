import "@testing-library/jest-dom/vitest"
import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/svelte"
import { OFFER } from "@tissai/db/mocks"
import { SIMILAR, BRAND } from "mocks"
import ProductTile from "./ProductTile.svelte"

const SEARCH_RESULT = {
  ...SIMILAR,
  brand: BRAND,
  price: OFFER.price,
}

describe("ProductTile", () => {
  afterEach(() => {
    cleanup()
  })

  it("shows product details", async () => {
    render(ProductTile, { product: SEARCH_RESULT })

    const title = screen.getByRole("heading", { level: 3 })
    const image = screen.getByRole("img", { name: SEARCH_RESULT.title })
    const detailLink = screen.getByRole("link")
    const price = screen.getByText(SEARCH_RESULT.price)
    const brandName = screen.queryByText(SEARCH_RESULT.brand.name)
    const brandLogo = screen.getByRole("img", {
      name: `Logo de ${SEARCH_RESULT.brand.name}`,
    })

    expect(image).toHaveAttribute("src", SEARCH_RESULT.image)
    expect(title).toHaveTextContent(SEARCH_RESULT.title)
    expect(price).toBeInTheDocument()
    expect(brandLogo).toBeInTheDocument()
    expect(brandName).not.toBeInTheDocument()
    expect(detailLink).toHaveAttribute(
      "href",
      expect.stringContaining(SEARCH_RESULT.id),
    )
  })

  it("handles brands without logo", async () => {
    render(ProductTile, { product: {
      ...SEARCH_RESULT,
      brand: {
        name: BRAND.name,
      },
    } })

    const brandName = screen.getByText(BRAND.name)
    const brandLogo = screen.queryByRole("img", {
      name: `Logo de ${BRAND.name}`,
    })

    expect(brandName).toBeInTheDocument()
    expect(brandLogo).not.toBeInTheDocument()
  })

  it("handles products without brand", async () => {
    render(ProductTile, { product: {
      ...SEARCH_RESULT,
      brand: null,
    } })

    const undef = screen.queryByText("undefined")
    const brandName = screen.queryByText(BRAND.name)
    const brandLogo = screen.queryByRole("img", {
      name: `Logo de ${BRAND.name}`,
    })

    expect(brandName).not.toBeInTheDocument()
    expect(brandLogo).not.toBeInTheDocument()
    expect(undef).not.toBeInTheDocument()
  })

  it("handles products without price", async () => {
    render(ProductTile, { product: {
      ...SEARCH_RESULT,
      price: undefined,
    } })

    const undef = screen.queryByText("undefined")
    const price = screen.queryByText(OFFER.price)

    expect(price).not.toBeInTheDocument()
    expect(undef).not.toBeInTheDocument()
  })
})
