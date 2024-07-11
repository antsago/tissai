import "@testing-library/jest-dom/vitest"
import { describe, test, expect, beforeEach } from "vitest"
import { render, screen, within, cleanup } from "@testing-library/svelte"
import { mockDbFixture, MockPg } from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import {
  PRODUCT,
  SIMILAR,
  BRAND,
  OFFER,
  SITE,
  STRING_ATTRIBUTE,
  CAT_ATTRIBUTE,
  BOOL_ATTRIBUTE,
} from "mocks"
import { load } from "./+page.server"
import page from "./+page.svelte"

const it = test.extend<{ db: mockDbFixture }>({
  db: [mockDbFixture, { auto: true }],
})

describe("Product details page", () => {
  beforeEach(() => {
    cleanup()
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
    brand: BRAND,
    attributes: [
      STRING_ATTRIBUTE,
      CAT_ATTRIBUTE,
      BOOL_ATTRIBUTE,
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
  async function loadAndRender(db: MockPg, sectionName: string, details = {}) {
    db.pool.query.mockResolvedValueOnce({
      rows: [
        {
          ...PRODUCT_DETAILS,
          ...details,
        },
      ],
    })
    db.pool.query.mockResolvedValueOnce({
      rows: [SIMILAR],
    })

    render(page, {
      data: await load({
        params: { productId: PRODUCT.id },
        locals: { db: Db() },
      } as any),
    } as any)
    const section = screen.getByRole("region", { name: sectionName })

    return within(section)
  }

  describe("details section", () => {
    it("shows product details", async ({ db }) => {
      const section = await loadAndRender(db, PRODUCT.title)

      const images = section.getAllByRole("img", { name: PRODUCT.title })
      const heading = section.getByRole("heading")
      const description = section.getByText(PRODUCT.description)
      const category = section.getByText(
        new RegExp(`^${CAT_ATTRIBUTE.label}.*${CAT_ATTRIBUTE.value}$`),
      )
      const stringAttribute = section.getByText(
        new RegExp(`^${STRING_ATTRIBUTE.label}.*${STRING_ATTRIBUTE.value}$`),
      )
      const boolAttribute = section.getByText(
        new RegExp(`^${BOOL_ATTRIBUTE.label}$`),
      )
      const brandName = section.getByText(BRAND.name)
      const brandLogo = section.getByRole("img", {
        name: `Logo de ${BRAND.name}`,
      })
      const noImages = section.queryByRole("img", { name: "Sin imagenes" })

      expect(images.map((i) => i.getAttribute("src"))).toStrictEqual(
        PRODUCT.images,
      )
      expect(noImages).not.toBeInTheDocument()
      expect(heading).toHaveTextContent(PRODUCT.title)
      expect(description).toBeInTheDocument()
      expect(category).toBeInTheDocument()
      expect(stringAttribute).toBeInTheDocument()
      expect(boolAttribute).toBeInTheDocument()
      expect(brandName).toBeInTheDocument()
      expect(brandLogo).toHaveAttribute("src", BRAND.logo)
    })

    it("handles products without images", async ({ db }) => {
      const section = await loadAndRender(db, PRODUCT.title, { images: [] })

      const images = section.queryAllByRole("img", { name: PRODUCT.title })
      const noImages = section.getByRole("img", { name: "Sin imagenes" })

      expect(images).toStrictEqual([])
      expect(noImages).toBeInTheDocument()
    })

    it("handles products without description", async ({ db }) => {
      const section = await loadAndRender(db, PRODUCT.title, {
        description: undefined,
      })

      const undef = section.queryByText("undefined")

      expect(undef).not.toBeInTheDocument()
    })

    it("handles products without attributes", async ({ db }) => {
      const section = await loadAndRender(db, PRODUCT.title, {
        attributes: [],
      })

      const undef = section.queryByText(/undefined/)

      expect(undef).not.toBeInTheDocument()
    })

    it("handles products without brand", async ({ db }) => {
      const section = await loadAndRender(db, PRODUCT.title, {
        brand: undefined,
      })

      const brandName = section.queryByText(BRAND.name)
      const brandLogo = section.queryByRole("img", {
        name: "Logo de undefined",
      })
      const undef = section.queryByText("undefined")

      expect(brandName).not.toBeInTheDocument()
      expect(brandLogo).not.toBeInTheDocument()
      expect(undef).not.toBeInTheDocument()
    })

    it("handles brands without logo", async ({ db }) => {
      const section = await loadAndRender(db, PRODUCT.title, {
        brand: { name: BRAND.name },
      })

      const brandName = section.queryByText(BRAND.name)
      const brandLogo = section.queryByRole("img", {
        name: `Logo de ${BRAND.name}`,
      })

      expect(brandName).toBeInTheDocument()
      expect(brandLogo).not.toBeInTheDocument()
    })
  })

  describe("offers section", async () => {
    it("shows offer details", async ({ db }) => {
      const section = await loadAndRender(db, "Compra en")

      const heading = section.getByRole("heading", { level: 2 })
      const title = section.getByRole("heading", { level: 3, name: SITE.name })
      const icon = section.getByRole("img", { name: `Icono de ${SITE.name}` })
      const title2 = section.getByRole("heading", {
        level: 3,
        name: OFFER2.site.name,
      })
      const seller = section.getByText(OFFER.seller)
      const price = section.getByText(OFFER.price)
      const currency = section.getByText(OFFER.currency)
      const urls = section.getAllByRole("link")
      const noOffers = section.queryByText(
        "No hemos encontrado este producto en ningún lado",
      )

      expect(heading).toHaveTextContent("Compra en")
      expect(icon).toBeInTheDocument()
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

    it("handles products without offers", async ({ db }) => {
      const section = await loadAndRender(db, "Compra en", { offers: [] })

      const title = section.queryByRole("heading", {
        level: 3,
        name: SITE.name,
      })
      const seller = section.queryByText(OFFER.seller)
      const price = section.queryByText(OFFER.price)
      const currency = section.queryByText(OFFER.currency)
      const url = section.queryByRole("link")
      const noOffers = section.getByText("producto descatalogado o sin ofertas")
      const undef = section.queryByText("undefined")

      expect(url).not.toBeInTheDocument()
      expect(title).not.toBeInTheDocument()
      expect(seller).not.toBeInTheDocument()
      expect(price).not.toBeInTheDocument()
      expect(currency).not.toBeInTheDocument()
      expect(undef).not.toBeInTheDocument()
      expect(noOffers).toBeInTheDocument()
    })

    describe.each([null, undefined])("price (%s)", async (value) => {
      it(`handles offers without price (${value})`, async ({ db }) => {
        const section = await loadAndRender(db, "Compra en", {
          offers: [{ ...PRODUCT_DETAILS.offers[0], price: value }],
        })

        const price = section.queryByText(OFFER.price)
        const undef = section.queryByText(String(value))

        expect(price).not.toBeInTheDocument()
        expect(undef).not.toBeInTheDocument()
      })
    })

    it("handles offers without currency", async ({ db }) => {
      const section = await loadAndRender(db, "Compra en", {
        offers: [{ ...PRODUCT_DETAILS.offers[0], currency: undefined }],
      })

      const price = section.getByText(OFFER.price)
      const currency = section.queryByText(OFFER.currency)
      const undef = section.queryByText("undefined")

      expect(price).toBeInTheDocument()
      expect(currency).not.toBeInTheDocument()
      expect(undef).not.toBeInTheDocument()
    })

    it("handles offers without seller", async ({ db }) => {
      const section = await loadAndRender(db, "Compra en", {
        offers: [{ ...PRODUCT_DETAILS.offers[0], seller: undefined }],
      })

      const seller = section.queryByText(OFFER.seller)
      const undef = section.queryByText("undefined")

      expect(seller).not.toBeInTheDocument()
      expect(undef).not.toBeInTheDocument()
    })
  })

  it("shows similar products", async ({ db }) => {
    const section = await loadAndRender(db, "Similares")

    const heading = section.getByRole("heading", { level: 2 })
    const title = section.getByRole("heading", { level: 3 })
    const image = section.getByRole("img")
    const buyLink = section.getByRole("link")

    expect(heading).toHaveTextContent("Similares")
    expect(title).toHaveTextContent(SIMILAR.title)
    expect(image).toHaveAttribute("src", SIMILAR.image)
    expect(buyLink).toHaveAttribute("href", expect.stringContaining(SIMILAR.id))
  })
})
