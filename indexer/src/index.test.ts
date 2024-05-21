import { expect, describe, it, beforeEach, vi } from 'vitest'
import { MockPg, PRODUCT, OFFER, BRAND, PAGE, AUGMENTED_DATA } from '#mocks'
import { BRANDS, CATEGORIES, PRODUCTS, SELLERS, TAGS, TRACES } from './Db/index.js'

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

    expect(pg).toHaveInserted(PRODUCTS, [
      PRODUCT.title,
      PRODUCT.description,
      PRODUCT.image,
      AUGMENTED_DATA.embedding,
      AUGMENTED_DATA.category,
      AUGMENTED_DATA.tags,
    ])
    expect(pg).toHaveInserted('offers', [PAGE.site, PAGE.url])
    expect(pg).toHaveInserted(CATEGORIES, [AUGMENTED_DATA.category])
    expect(pg).toHaveInserted(TAGS, [AUGMENTED_DATA.tags[0]])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, PRODUCTS.toString()])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, "offers"])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, CATEGORIES.toString(), AUGMENTED_DATA.category])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, TAGS.toString(), AUGMENTED_DATA.tags[0]])
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

    expect(pg).toHaveInserted(SELLERS, [OFFER.seller])
    expect(pg).toHaveInserted('offers', [PAGE.site, PAGE.url, OFFER.price, OFFER.curency])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, SELLERS.toString(), OFFER.seller])
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

    expect(pg).toHaveInserted(PRODUCTS, [BRAND.name])
    expect(pg).toHaveInserted(BRANDS, [BRAND.name, BRAND.logo])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, BRANDS.toString(), BRAND.name])
  })

  it("extracts multiple tags", async () => {
    const page = fullPage({
      "@type": "Product",
      "name": "Test multiple tags",
    })
    pg.query.mockResolvedValueOnce({ rows: [page] }) 

    await import('./index.js')

    expect(pg).toHaveInserted(TAGS, ["multiple"])
    expect(pg).toHaveInserted(TAGS, ["tags"])
  })
})
