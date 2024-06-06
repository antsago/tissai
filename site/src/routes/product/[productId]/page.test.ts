import "@testing-library/jest-dom/vitest"
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { PRODUCT, SIMILAR, MockPg, BRAND, OFFER, SITE } from "mocks"
import { Products } from "$lib/server"
import { load } from "./+page.server"
import page from "./+page.svelte"

describe("Product details page", () => {
  let pg: MockPg
  beforeEach(() => {
    cleanup()

    pg = MockPg()
  })

  const OFFER2 = {
    url: "www.example.com/offer2.html",
    site: {
      name: "Site 2"
    }
  }
  async function loadAndRender(sectionName: string) {
    pg.pool.query.mockResolvedValueOnce({
      rows: [
        {
          title: PRODUCT.title,
          description: PRODUCT.description,
          images: PRODUCT.images,
          brand: [BRAND],
          similar: [
            {
              title: SIMILAR.name,
              id: SIMILAR.id,
              image: SIMILAR.image,
            },
          ],
          offers: [
            {
              url: OFFER.url,
              price: OFFER.price,
              currency: OFFER.currency,
              seller: OFFER.seller,
              site: {
                name: SITE.name,
                icon: SITE.icon,
              },
            },
            OFFER2,
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
    const section = await loadAndRender(PRODUCT.title)

    const image = section.getByRole("img", { name: PRODUCT.title })
    const heading = section.getByRole("heading")
    const description = section.getByText(PRODUCT.description)
    const brandName = section.getByText(BRAND.name)
    const brandLogo = section.getByRole("img", { name: BRAND.name })

    expect(image).toHaveAttribute("src", PRODUCT.images[0])
    expect(heading).toHaveTextContent(PRODUCT.title)
    expect(description).toBeInTheDocument()
    expect(brandName).toBeInTheDocument()
    expect(brandLogo).toHaveAttribute("src", BRAND.logo)
  })

  it("shows offers", async () => {
    const section = await loadAndRender("Compra en")

    const heading = section.getByRole("heading", { level: 2 })
    const title = section.getByRole("heading", { level: 3, name: SITE.name })
    const title2 = section.getByRole("heading", { level: 3, name: OFFER2.site.name })
    const seller = section.getByText(OFFER.seller)
    const price = section.getByText(OFFER.price)
    const currency = section.getByText(OFFER.currency)
    const [offer1, offer2] = section.getAllByRole("link")

    expect(heading).toHaveTextContent("Compra en")
    expect(offer1).toHaveAttribute("href", OFFER.url)
    expect(offer2).toHaveAttribute("href", OFFER2.url)
    expect(title).toBeInTheDocument()
    expect(title2).toBeInTheDocument()
    expect(seller).toBeInTheDocument()
    expect(price).toBeInTheDocument()
    expect(currency).toBeInTheDocument()
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
