import { expect, describe, it, beforeEach, vi } from 'vitest'
import type { MockPg } from '#mocks'

const PRODUCT = {
  title: "Test product",
  description: "Product description",
  image: "https://example.com/product-image.jpg"
}
const OFFER = {
  seller: "Test Seller",
  price: 70,
  curency: "EUR",
}
const BRAND = {
  name: "Test",
  image: "https://example.com/brand.jpg",
}
const PAGE = {
  id: "test_id",
  url: "https://example.com/product",
  site: "site-id",
}

const fullPage = (ld: object) => ({
  ...PAGE,
  body: `
    <html>
      <head>
        <script type="application/ld+json">
        ${JSON.stringify({
          "@context": "https://schema.org/",
          ...ld,
        })}
        </script>
      </head>
    </html>
  `,
})

describe('indexer', () => {
  let pg: MockPg
  beforeEach(async () => {
    vi.resetModules()

    const { MockPg } = await import('#mocks')
    pg = MockPg()
  })

  it("extracts product and offer", async () => {
    const page = fullPage({
      "@type": "Product",
      "name": PRODUCT.title,
      "description": PRODUCT.description,
      "image": PRODUCT.image,
    })
    pg.query.mockResolvedValueOnce({ rows: [page] }) 

    await import('./index.js')

    expect(pg).toHaveInserted('products', [PRODUCT.title, PRODUCT.description, PRODUCT.image])
    expect(pg).toHaveInserted('offers', [PAGE.site, PAGE.url])
  })

  it("extracts offer details", async () => {
    const page = fullPage({
      "@type": "Product",
      "name": PRODUCT.title,
      "description": PRODUCT.description,
      "image": PRODUCT.image,
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/offer",
        "price": OFFER.price,
        "priceCurrency": OFFER.curency,
        "seller": {
          "@type": "Organization",
          "name": OFFER.seller,
        }
      }
    })
    pg.query.mockResolvedValueOnce({ rows: [page] }) 

    await import('./index.js')

    expect(pg).toHaveInserted('sellers', [OFFER.seller])
    expect(pg).toHaveInserted('offers', [PAGE.site, PAGE.url, OFFER.price, OFFER.curency])
  })

  it("does not re-insert sellers", async () => {
    const page = fullPage({
      "@type": "Product",
      "name": PRODUCT.title,
      "description": PRODUCT.description,
      "image": PRODUCT.image,
      "offers": {
        "@type": "Offer",
        "seller": {
          "@type": "Organization",
          "name": OFFER.seller,
        }
      }
    })
    pg.query.mockResolvedValueOnce({ rows: [page] }) 
    pg.query.mockResolvedValueOnce({ rows: [{ name: OFFER.seller }] }) 

    await import('./index.js')

    expect(pg).not.toHaveInserted('sellers', [OFFER.seller])
  })

  it("extracts product brand", async () => {
    const page = fullPage({
      "@type": "Product",
      "name": PRODUCT.title,
      "brand": {
        "@type": "Brand",
        "name": BRAND.name,
        "image": BRAND.image,
      },
    })
    pg.query.mockResolvedValueOnce({ rows: [page] }) 

    await import('./index.js')

    expect(pg).toHaveInserted('products', [PRODUCT.title, BRAND.name])
    expect(pg).toHaveInserted('brands', [BRAND.name, BRAND.image])
  })
})
