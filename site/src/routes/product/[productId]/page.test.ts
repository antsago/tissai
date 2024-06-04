import "@testing-library/jest-dom/vitest"
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { PRODUCT, SIMILAR, MockPg } from "mocks"
import { Products } from "$lib/server"
import { load } from "./+page.server"
import page from "./+page.svelte"

describe("Product details page", () => {
  let pg: MockPg
  beforeEach(() => {
    cleanup()

    pg = MockPg()
  })

  async function loadAndRender(sectionName: string) {
    pg.pool.query.mockResolvedValueOnce({
      rows: [
        {
          title: PRODUCT.name,
          description: PRODUCT.description,
          images: PRODUCT.images,
          similar: [
            {
              title: SIMILAR.name,
              id: SIMILAR.id,
              image: SIMILAR.image,
            },
          ],
          offers: [
            {
              url: PRODUCT.product_uri,
              price: 10,
              currency: "EUR",
              seller: "The seller",
              site_name: PRODUCT.shop_name,
              icon: "https://example.com/icon",
            },
          ],
        },
      ],
    })

    render(page, {
      data: await load({
        params: { productId: PRODUCT.id },
        locals: { products: Products() },
      } as any),
    } as any)
    const section = screen.getByRole("region", { name: sectionName })

    return within(section)
  }

  it("shows product's details", async () => {
    const section = await loadAndRender(PRODUCT.name)

    const image = section.getByRole("img")
    const heading = section.getByRole("heading")
    const description = section.getByText(PRODUCT.description)
    const buyLink = section.getByRole("link")

    expect(image).toHaveAttribute("src", PRODUCT.images[0])
    expect(image).toHaveAccessibleName(PRODUCT.name)
    expect(heading).toHaveTextContent(PRODUCT.name)
    expect(description).toBeInTheDocument()
    expect(buyLink).toHaveAttribute("href", PRODUCT.product_uri)
    expect(buyLink).toHaveAccessibleName(
      expect.stringContaining(PRODUCT.shop_name),
    )
  })

  it("shows similar products", async () => {
    const section = await loadAndRender("Similares")

    const heading = section.getByRole("heading", { level: 2 })
    const title = section.getByRole("heading", { level: 3 })
    const image = section.getByRole("img")
    const buyLink = section.getByRole("link")

    expect(heading).toHaveTextContent("Similares")
    expect(title).toHaveTextContent(SIMILAR.name)
    expect(image).toHaveAttribute("src", SIMILAR.image)
    expect(buyLink).toHaveAttribute("href", expect.stringContaining(SIMILAR.id))
  })
})
