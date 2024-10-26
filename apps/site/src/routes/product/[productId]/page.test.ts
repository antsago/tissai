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
    attributes: [],
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
    similar: [SIMILAR],
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

    render(page, {
      data: await load({
        params: { productId: PRODUCT.id },
        locals: { db: Db() },
      } as any),
    } as any)
    const section = screen.getByRole("region", { name: sectionName })

    return within(section)
  }

  it("renders", async ({ db }) => {
    const section = await loadAndRender(db, PRODUCT.title)
    const heading = section.getByRole("heading")
    expect(heading).toHaveTextContent(PRODUCT.title)
  })
})
