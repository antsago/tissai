import { expect, describe, it, beforeEach, vi } from 'vitest'
import { MockPg, PRODUCT, OFFER, BRAND, PAGE, AUGMENTED_DATA } from '#mocks'

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

  it("extracts product details", async () => {
    const page = fullPage({
      "@type": "Product",
      "name": PRODUCT.title,
      "description": PRODUCT.description,
      "image": PRODUCT.image,
    })
    pg.query.mockResolvedValueOnce({ rows: [page] }) 

    await import('./index.js')

    expect(pg).toHaveInserted('products', [
      PRODUCT.title,
      PRODUCT.description,
      PRODUCT.image,
      AUGMENTED_DATA.embedding,
      AUGMENTED_DATA.category,
      AUGMENTED_DATA.tags,
    ])
    expect(pg).toHaveInserted('offers', [PAGE.site, PAGE.url])
    expect(pg).toHaveInserted('categories', [AUGMENTED_DATA.category])
    expect(pg).toHaveInserted('tags', [AUGMENTED_DATA.tags[0]])
  })

  it("extracts offer details", async () => {
    const page = fullPage({
      "@type": "Product",
      "name": PRODUCT.title,
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

  it("does not re-insert existing seller", async () => {
    const page = fullPage({
      "@type": "Product",
      "name": PRODUCT.title,
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
        "image": BRAND.logo,
      },
    })
    pg.query.mockResolvedValueOnce({ rows: [page] }) 

    await import('./index.js')

    expect(pg).toHaveInserted('products', [BRAND.name])
    expect(pg).toHaveInserted('brands', [BRAND.name, BRAND.logo])
  })

  it("does not re-insert existing brand", async () => {
    const page = fullPage({
      "@type": "Product",
      "name": PRODUCT.title,
      "brand": {
        "@type": "Brand",
        "name": BRAND.name,
        "image": BRAND.logo,
      },
    })
    pg.query.mockResolvedValueOnce({ rows: [page] }) 
    pg.query.mockResolvedValueOnce({ rows: [BRAND] }) 

    await import('./index.js')

    expect(pg).not.toHaveInserted('brands', [])
  })
})
