const { readdir } = require("fs/promises")
const Crawler = require("./Crawler")

jest.mock("fs/promises")

describe("Crawler", () => {
  const DOMAIN = "example.com"
  const PRODUCT_TOKEN = "FooBar/1.0"

  let shop
  let response
  beforeEach(() => {
    response = jest.fn()

    fetch = jest.fn((url) =>
      Promise.resolve({
        text: response,
        url,
        status: 200,
        headers: new Headers(),
      }),
    )
    readdir.mockResolvedValue([])

    shop = {
      name: "Example",
      domain: DOMAIN,
      icon: "https://example.com/icon",
    }
  })

  describe("getProducts", () => {
    const PRODUCT_URL = `https://${DOMAIN}/product`
    const ROBOTS = `Sitemap: https://${DOMAIN}/sitemap.xm`
    const SITEMAP = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>${PRODUCT_URL}</loc></url>
      </urlset>
    `

    const getProducts = async (...args) => {
      const crawler = await Crawler([shop], {
        productToken: PRODUCT_TOKEN,
        dataFolder: "./foo",
        crawlDelay: 1,
      })

      const result = []
      for await (const url of crawler.getProducts(...args)) {
        result.push(url)
      }
      return result
    }

    it("returns products from the shop", async () => {
      const PRODUCT = {
        name: "The name in og",
        description: "The description in og",
        image: `https//image.com/og-image`,
        sellers: [
          {
            productUrl: PRODUCT_URL,
            shop: {
              name: shop.name,
              image: shop.icon,
            },
          },
        ],
      }
      const PAGE_CONTENT = `<html>
        <script type="application/ld+json">
          ${JSON.stringify({ ...PRODUCT, ["@type"]: "Product" })}
        </script>
      </html>`
      response
        .mockResolvedValueOnce(ROBOTS)
        .mockResolvedValueOnce(SITEMAP)
        .mockResolvedValueOnce(PAGE_CONTENT)

      const result = await getProducts()

      expect(result).toStrictEqual([expect.objectContaining(PRODUCT)])
    })

    it("ignores disallowed urls", async () => {
      const robots = `
        Sitemap: https://${DOMAIN}/sitemap.xml
        User-Agent: ${PRODUCT_TOKEN}
        Disallow: /product
      `
      response.mockResolvedValueOnce(robots).mockResolvedValueOnce(SITEMAP)

      const result = await getProducts()

      expect(result).toStrictEqual([])
    })

    it("ignores non-product pages", async () => {
      const PAGE_CONTENT = `<html>
        <script type="application/ld+json">
          ${JSON.stringify({ ["@type"]: "Breadcrumb" })}
        </script>
      </html>`
      response
        .mockResolvedValueOnce(ROBOTS)
        .mockResolvedValueOnce(SITEMAP)
        .mockResolvedValueOnce(PAGE_CONTENT)

      const result = await getProducts()

      expect(result).toStrictEqual([])
    })

    it("ignores pages without keywords", async () => {
      const keyword = "good"
      const PRODUCT = {
        name: "The name in og",
        description: "The description in og",
        image: `https//image.com/og-image`,
        sellers: [
          {
            productUrl: PRODUCT_URL,
            shop: {
              name: shop.name,
              image: shop.icon,
            },
          },
        ],
      }
      const PAGE_CONTENT = `<html>
        <script type="application/ld+json">
          ${JSON.stringify({ ...PRODUCT, ["@type"]: "Product" })}
        </script>
      </html>`
      response
        .mockResolvedValueOnce(ROBOTS)
        .mockResolvedValueOnce(SITEMAP)
        .mockResolvedValueOnce(PAGE_CONTENT)

      const result = await getProducts({ keywords: [keyword] })

      expect(result).toStrictEqual([])
      expect(fetch).not.toHaveBeenCalledWith(PRODUCT_URL, expect.anything())
    })

    it("ignores pages without shops keywords", async () => {
      shop.urlKeywords = ["good"]
      const PRODUCT = {
        name: "The name in og",
        description: "The description in og",
        image: `https//image.com/og-image`,
        sellers: [
          {
            productUrl: PRODUCT_URL,
            shop: {
              name: shop.name,
              image: shop.icon,
            },
          },
        ],
      }
      const PAGE_CONTENT = `<html>
        <script type="application/ld+json">
          ${JSON.stringify({ ...PRODUCT, ["@type"]: "Product" })}
        </script>
      </html>`
      response
        .mockResolvedValueOnce(ROBOTS)
        .mockResolvedValueOnce(SITEMAP)
        .mockResolvedValueOnce(PAGE_CONTENT)

      const result = await getProducts()

      expect(result).toStrictEqual([])
      expect(fetch).not.toHaveBeenCalledWith(PRODUCT_URL, expect.anything())
    })

    it("stops crawling after limit", async () => {
      const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url><loc>${PRODUCT_URL}</loc></url>
          <url><loc>${PRODUCT_URL}2</loc></url>
        </urlset>
      `
      const PRODUCT = {
        name: "The name in og",
        description: "The description in og",
        image: `https//image.com/og-image`,
        sellers: [
          {
            productUrl: PRODUCT_URL,
            shop: {
              name: shop.name,
              image: shop.icon,
            },
          },
        ],
      }
      const PAGE_CONTENT = `<html>
        <script type="application/ld+json">
          ${JSON.stringify({ ...PRODUCT, ["@type"]: "Product" })}
        </script>
      </html>`
      response
        .mockResolvedValueOnce(ROBOTS)
        .mockResolvedValueOnce(sitemap)
        .mockResolvedValueOnce(PAGE_CONTENT)
        .mockResolvedValueOnce(PAGE_CONTENT)

      const result = await getProducts({ limit: 1 })

      expect(result.length).toBe(1)
      expect(fetch).toHaveBeenCalledTimes(3)
    })
  })
})
