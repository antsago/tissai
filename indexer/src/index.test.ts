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
        ${JSON.stringify(ld)}
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
      "@context": "https://schema.org/",
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
      "@context": "https://schema.org/",
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

    expect(pg).toHaveInserted('products', [])
    expect(pg).toHaveInserted('sellers', [OFFER.seller])
    expect(pg).toHaveInserted('offers', [PAGE.site, PAGE.url, OFFER.price, OFFER.curency])
  })

  it("does not re-insert sellers", async () => {
    const page = fullPage({
      "@context": "https://schema.org/",
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

    expect(pg).toHaveInserted('products', [])
    expect(pg).toHaveInserted('offers', [])
    expect(pg).not.toHaveInserted('sellers', [OFFER.seller])
  })
})
