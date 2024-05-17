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
  body: `
    <html>
      <head>
        <script type="application/ld+json">
        ${JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": PRODUCT.title,
          "description": PRODUCT.description,
          "image": PRODUCT.image,
        })}
        </script>
      </head>
    </html>
  `,
  url: "https://example.com/product",
  site: "site-id",
}

describe('indexer', () => {
  let pg: MockPg
  beforeEach(async () => {
    vi.resetModules()

    const { MockPg } = await import('#mocks')
    pg = MockPg()
  })

  it("extracts product and offer", async () => {
    pg.query.mockResolvedValue({ rows: [] }) 
    pg.query.mockResolvedValueOnce({ rows: [PAGE] }) 

    await import('./index.js')

    expect(pg.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO products'), expect.arrayContaining([PRODUCT.title, PRODUCT.description, PRODUCT.image]))
    expect(pg.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO offers'), expect.arrayContaining([PAGE.site, PAGE.url]))
  })

  it("extracts offer details", async () => {
    const PAGE2 = {
      id: "test_id",
      body: `
        <html>
          <head>
            <script type="application/ld+json">
            ${JSON.stringify({
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
            })}
            </script>
          </head>
        </html>
      `,
      url: "https://example.com/product",
      site: "site-id",
    }
    pg.query.mockResolvedValue({ rows: [] }) 
    pg.query.mockResolvedValueOnce({ rows: [PAGE2] }) 

    await import('./index.js')

    expect(pg.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO products'), expect.anything())
    expect(pg.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO sellers'),
      expect.arrayContaining([OFFER.seller]),
    )
    expect(pg.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO offers'),
      expect.arrayContaining([PAGE.site, PAGE.url, OFFER.price, OFFER.curency]),
    )
  })
})
