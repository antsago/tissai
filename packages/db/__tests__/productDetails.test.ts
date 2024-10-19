import { describe, test } from "vitest"
import {
  PRODUCT,
  SITE,
  OFFER,
  BRAND,
  SELLER,
  ATTRIBUTE,
  dbFixture,
  CATEGORY_NODE,
  LABEL_NODE,
  VALUE_NODE,
} from "#mocks"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("productDetails", () => {
  it("retrieves all details", async ({ expect, db }) => {
    const SIMILAR = {
      id: "92b15b90-3673-4a0e-b57c-8f9835a4f4d9",
      title: PRODUCT.title,
      images: PRODUCT.images,
    }
    await db.load({
      nodes: [CATEGORY_NODE, LABEL_NODE, VALUE_NODE],
      brands: [BRAND],
      sites: [SITE],
      sellers: [SELLER],
      products: [SIMILAR, PRODUCT],
      offers: [
        OFFER,
        {
          ...OFFER,
          price: OFFER.price + 10,
          id: "3931b158-a7d2-41d5-9b13-7266fe976a2a",
        },
      ],
      attributes: [ATTRIBUTE],
    })

    const result = await db.products.getDetails(PRODUCT.id)

    expect(result).toStrictEqual({
      title: PRODUCT.title,
      description: PRODUCT.description,
      images: PRODUCT.images,
      category: CATEGORY_NODE.name,
      attributes: [{ label: LABEL_NODE.name, value: VALUE_NODE.name }],
      brand: BRAND,
      similar: [
        {
          id: SIMILAR.id,
          title: SIMILAR.title,
          image: SIMILAR.images[0],
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
        {
          url: OFFER.url,
          price: OFFER.price + 10,
          currency: OFFER.currency,
          seller: OFFER.seller,
          site: {
            name: SITE.name,
            icon: SITE.icon,
          },
        },
      ],
    })
  })

  it("handles title-only products", async ({ expect, db }) => {
    await db.load({
      products: [{
        id: PRODUCT.id,
        title: PRODUCT.title,
      }],
    })

    const result = await db.products.getDetails(PRODUCT.id)

    expect(result).toStrictEqual({
      title: PRODUCT.title,
      description: null,
      images: null,
      brand: null,
      category: null,
      attributes: null,
      similar: null,
      offers: null,
    })
  })

  it("handles partial properties", async ({ expect, db }) => {
    const SIMILAR = {
      id: "92b15b90-3673-4a0e-b57c-8f9835a4f4d9",
      title: PRODUCT.title,
    }
    await db.load({
      brands: [{
        name: BRAND.name
      }],
      sites: [SITE],
      products: [SIMILAR, {
        id: PRODUCT.id,
        title: PRODUCT.title,
        brand: PRODUCT.brand,
      }],
      offers: [
        {
          id: OFFER.id,
          product: OFFER.product,
          site: OFFER.site,
          url: OFFER.url
        },
      ],
    })

    const result = await db.products.getDetails(PRODUCT.id)

    expect(result).toStrictEqual({
      title: PRODUCT.title,
      description: null,
      images: null,
      category: null,
      attributes: null,
      brand: {
        name: BRAND.name,
        logo: null,
      },
      similar: [
        {
          id: SIMILAR.id,
          title: SIMILAR.title,
          image: null,
        },
      ],
      offers: [
        {
          url: OFFER.url,
          seller: null,
          price: null,
          currency: null,
          site: {
            name: SITE.name,
            icon: SITE.icon,
          },
        },
      ],
    })
  })
})
