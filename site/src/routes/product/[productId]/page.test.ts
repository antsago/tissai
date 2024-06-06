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
      name: "Site 2",
    },
  }
  const PRODUCT_DETAILS = {
    title: PRODUCT.title,
    description: PRODUCT.description,
    images: PRODUCT.images,
    brand: [BRAND],
    category: PRODUCT.category,
    tags: [...PRODUCT.tags, "muy"],
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
  }
  async function loadAndRender(sectionName: string, details = {}) {
    pg.pool.query.mockResolvedValueOnce({
      rows: [{
        ...PRODUCT_DETAILS,
        ...details,
      }],
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

  describe("details section", () => {
    it("shows product details", async () => {
      const section = await loadAndRender(PRODUCT.title)
  
      const images = section.getAllByRole("img", { name: PRODUCT.title })
      const heading = section.getByRole("heading")
      const description = section.getByText(PRODUCT.description)
      const tags = section.getAllByText(
        new RegExp(`^(${PRODUCT_DETAILS.tags.join(")|(")})$`),
      )
      const category = section.getByText(PRODUCT.category)
      const brandName = section.getByText(BRAND.name)
      const brandLogo = section.getByRole("img", { name: `Logo de ${BRAND.name}` })
      const noImages = section.queryByRole("img", { name: "Sin imagenes" })
  
      expect(images.map((i) => i.getAttribute("src"))).toStrictEqual(
        PRODUCT.images,
      )
      expect(noImages).not.toBeInTheDocument()
      expect(heading).toHaveTextContent(PRODUCT.title)
      expect(description).toBeInTheDocument()
      expect(category).toBeInTheDocument()
      expect(tags.length).toBe(PRODUCT_DETAILS.tags.length)
      expect(brandName).toBeInTheDocument()
      expect(brandLogo).toHaveAttribute("src", BRAND.logo)
    })

    it("handles products without images", async () => {
      const section = await loadAndRender(PRODUCT.title, { images: [] })
  
      const images = section.queryAllByRole("img", { name: PRODUCT.title })
      const noImages = section.getByRole("img", { name: "Sin imagenes" })
  
      expect(images).toStrictEqual([])
      expect(noImages).toBeInTheDocument()
    })

    it("handles products without description", async () => {
      const section = await loadAndRender(PRODUCT.title, { description: undefined })
  
      const undef = section.queryByText('undefined')
  
      expect(undef).not.toBeInTheDocument()
    })

    it("handles products without brand", async () => {
      const section = await loadAndRender(PRODUCT.title, { brand: [] })
  
      const brandName = section.queryByText(BRAND.name)
      const brandLogo = section.queryByRole("img", { name: "Logo de undefined" })
      const undef = section.queryByText('undefined')
  
      expect(brandName).not.toBeInTheDocument()
      expect(brandLogo).not.toBeInTheDocument()
      expect(undef).not.toBeInTheDocument()
    })

    it("handles brands without logo", async () => {
      const section = await loadAndRender(PRODUCT.title, { brand: [{ name: BRAND.name }] })
  
      const brandName = section.queryByText(BRAND.name)
      const brandLogo = section.queryByRole("img", { name: `Logo de ${BRAND.name}` })
  
      expect(brandName).toBeInTheDocument()
      expect(brandLogo).not.toBeInTheDocument()
    })
  })

  describe("offers section", async () => {
    it("shows offer details", async () => {
      const section = await loadAndRender("Compra en")
  
      const heading = section.getByRole("heading", { level: 2 })
      const title = section.getByRole("heading", { level: 3, name: SITE.name })
      const title2 = section.getByRole("heading", {
        level: 3,
        name: OFFER2.site.name,
      })
      const seller = section.getByText(OFFER.seller)
      const price = section.getByText(OFFER.price)
      const currency = section.getByText(OFFER.currency)
      const urls = section.getAllByRole("link", { name: "Link de compra"})
      const noOffers = section.queryByText("No hemos encontrado este producto en ningún lado")
  
      expect(heading).toHaveTextContent("Compra en")
      expect(urls.map((u) => u.getAttribute("href"))).toStrictEqual([
        OFFER.url,
        OFFER2.url,
      ])
      expect(title).toBeInTheDocument()
      expect(title2).toBeInTheDocument()
      expect(seller).toBeInTheDocument()
      expect(price).toBeInTheDocument()
      expect(currency).toBeInTheDocument()
      expect(noOffers).not.toBeInTheDocument()
    })

    it("handles products without offers", async () => {
      const section = await loadAndRender("Compra en", { offers: [] })
  
      const title = section.queryByRole("heading", { level: 3, name: SITE.name })
      const seller = section.queryByText(OFFER.seller)
      const price = section.queryByText(OFFER.price)
      const currency = section.queryByText(OFFER.currency)
      const url = section.queryByRole("link")
      const noOffers = section.getByText("No hemos encontrado este producto en ningún lado")
      const undef = section.queryByText('undefined')
  
      expect(url).not.toBeInTheDocument()
      expect(title).not.toBeInTheDocument()
      expect(seller).not.toBeInTheDocument()
      expect(price).not.toBeInTheDocument()
      expect(currency).not.toBeInTheDocument()
      expect(undef).not.toBeInTheDocument()
      expect(noOffers).toBeInTheDocument()
    })

    it("handles offers without price", async () => {
      const section = await loadAndRender("Compra en", { offers: [{ ...PRODUCT_DETAILS.offers[0], price: undefined }] })
  
      const price = section.queryByText(OFFER.price)
      const currency = section.queryByText(OFFER.currency)
      const undef = section.queryByText('undefined')
  
      expect(price).not.toBeInTheDocument()
      expect(currency).not.toBeInTheDocument()
      expect(undef).not.toBeInTheDocument()
    })

    it("handles offers without currency", async () => {
      const section = await loadAndRender("Compra en", { offers: [{ ...PRODUCT_DETAILS.offers[0], currency: undefined }] })
  
      const price = section.getByText(OFFER.price)
      const currency = section.queryByText(OFFER.currency)
      const undef = section.queryByText('undefined')
  
      expect(price).toBeInTheDocument()
      expect(currency).not.toBeInTheDocument()
      expect(undef).not.toBeInTheDocument()
    })

    it("handles offers without seller", async () => {
      const section = await loadAndRender("Compra en", { offers: [{ ...PRODUCT_DETAILS.offers[0], seller: undefined }] })
  
      const seller = section.queryByText(OFFER.seller)
      const undef = section.queryByText('undefined')
  
      expect(seller).not.toBeInTheDocument()
      expect(undef).not.toBeInTheDocument()
    })
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
