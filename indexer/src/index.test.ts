import { expect, describe, it, beforeEach, vi } from 'vitest'
import { MockPg } from '#mocks'

describe('indexer', () => {
  let pg: MockPg
  beforeEach(() => {
    pg = MockPg()
  })

  const PRODUCT = {
    title: "Test product",
    description: "Product description",
    image: "https://example.com/product-image.jpg"
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

  it("extracts product and offer", async () => {
    pg.query.mockResolvedValue({ rows: [] }) 
    pg.query.mockResolvedValueOnce({ rows: [PAGE] }) 

    await import('./index.js')

    expect(pg.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO products'), expect.arrayContaining([PRODUCT.title, PRODUCT.description, PRODUCT.image]))
    expect(pg.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO offers'), expect.arrayContaining([PAGE.site, PAGE.url]))
  })
})
