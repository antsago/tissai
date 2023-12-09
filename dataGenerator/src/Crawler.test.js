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
  
  describe("getAllowedUrl", () => {
    const getAllowedUrls = async () => {
      const crawler = await Crawler(shop, {
        productToken: PRODUCT_TOKEN,
        loggingPath: "./foo",
        crawlDelay: 1,
      })

      const result = []
      for await (const url of crawler.getAllowedUrls()) {
        result.push(url)
      }
      return result
    }

    it("lists allowed urls", async () => {
      const url1 = `https://${DOMAIN}/url1`
      const url2 = `https://${DOMAIN}/url2/`
      const robots = `Sitemap: https://${DOMAIN}/sitemap.xml`
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url><url><loc>${url2}</loc></url></urlset>`
      response.mockResolvedValueOnce(robots).mockResolvedValueOnce(sitemap)

      const result = await getAllowedUrls()

      expect(result).toStrictEqual([url1, url2])
    })

    it("filters disallowed urls", async () => {
      const url1 = `https://${DOMAIN}/url1`
      const url2 = `https://${DOMAIN}/url2/`
      const robots = `Sitemap: https://${DOMAIN}/sitemap.xml\nUser-Agent: ${PRODUCT_TOKEN}\nDisallow: /url2`
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url><url><loc>${url2}</loc></url></urlset>`
      response.mockResolvedValueOnce(robots).mockResolvedValueOnce(sitemap)

      const result = await getAllowedUrls()

      expect(result).toStrictEqual([url1])
    })
  })

  describe("getContent", () => {
    it("fetches and parses page", async () => {
      const crawler = await Crawler(shop, {
        productToken: PRODUCT_TOKEN,
        loggingPath: "./foo",
        crawlDelay: 1,
      })
      const url = `https://${DOMAIN}/url1`
      const content = `<html></html>`
      response.mockResolvedValueOnce(content)

      const result = await crawler.getContent(url)

      expect(result).toStrictEqual(expect.objectContaining({ url }))
    })
  })
})
