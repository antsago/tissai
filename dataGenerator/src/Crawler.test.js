const { readdir } = require("fs/promises")
const Crawler = require("./Crawler")

jest.mock("fs/promises")

describe("Crawler", () => {
  const DOMAIN = "example.com"
  const PRODUCT_TOKEN = "FooBar/1.0"

  let response
  let crawler
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

    crawler = new Crawler(DOMAIN, {
      productToken: PRODUCT_TOKEN,
      loggingPath: "./foo",
      crawlDelay: 1,
    })
  })

  describe("getAllowedUrl", () => {
    const getAllowedUrls = async () => {
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

    it("supports siteindexes", async () => {
      const url1 = `https://${DOMAIN}/url1`
      const url2 = `https://${DOMAIN}/url2/`
      const robots = `Sitemap: https://${DOMAIN}/siteindex.xml\nUser-Agent: ${PRODUCT_TOKEN}\nDisallow:`
      const siteindex = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap><loc>https://${DOMAIN}/sitemap1.xml</loc></sitemap>
        <sitemap><loc>https://${DOMAIN}/sitemap2.xml</loc></sitemap>
      </sitemapindex>`
      const sitemap1 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url></urlset>`
      const sitemap2 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url2}</loc></url></urlset>`
      response
        .mockResolvedValueOnce(robots)
        .mockResolvedValueOnce(siteindex)
        .mockResolvedValueOnce(sitemap1)
        .mockResolvedValueOnce(sitemap2)

      const result = await getAllowedUrls()

      expect(result).toStrictEqual([url1, url2])
    })

    it("ignores disallowed sitemaps", async () => {
      const url1 = `https://${DOMAIN}/url1`
      const url2 = `https://${DOMAIN}/url2/`
      const robots = `Sitemap: https://${DOMAIN}/sitemap.xml\nSitemap: https://${DOMAIN}/sitemap2.xml\nUser-Agent: ${PRODUCT_TOKEN}\nDisallow:/sitemap2`
      const sitemap1 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url></urlset>`
      const sitemap2 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url2}</loc></url></urlset>`
      response
        .mockResolvedValueOnce(robots)
        .mockResolvedValueOnce(sitemap1)
        .mockResolvedValueOnce(sitemap2)

      const result = await getAllowedUrls()

      expect(result).toStrictEqual([url1])
    })

    it("ignores disallowed siteindex", async () => {
      const url1 = `https://${DOMAIN}/url1`
      const url2 = `https://${DOMAIN}/url2/`
      const robots = `Sitemap: https://${DOMAIN}/sitemap.xml\nSitemap: https://${DOMAIN}/siteindex.xml\nUser-Agent: ${PRODUCT_TOKEN}\nDisallow:/siteindex`
      const siteindex = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap><loc>https://${DOMAIN}/sitemap2.xml</loc></sitemap>
      </sitemapindex>`
      const sitemap1 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url></urlset>`
      const sitemap2 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url2}</loc></url></urlset>`
      response
        .mockResolvedValueOnce(robots)
        .mockResolvedValueOnce(sitemap1)
        .mockResolvedValueOnce(siteindex)
        .mockResolvedValueOnce(sitemap2)

      const result = await getAllowedUrls()

      expect(result).toStrictEqual([url1])
    })

    it("ignores sitemaps and siteindex with retrieval errors", async () => {
      const url1 = `https://${DOMAIN}/url1`
      const robots = `Sitemap: https://${DOMAIN}/sitemap.xml\nSitemap: https://${DOMAIN}/sitemap2.xml\nSitemap: https://${DOMAIN}/siteindex.xml`
      const sitemap2 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url></urlset>`
      response
        .mockResolvedValueOnce(robots)
        .mockRejectedValueOnce(new Error("Booh!"))
        .mockResolvedValueOnce(sitemap2)
        .mockRejectedValueOnce(new Error("Booh!"))

      const result = await getAllowedUrls()

      expect(result).toStrictEqual([url1])
    })
  })

  describe("getContent", () => {
    it("returns linked data", async () => {
      const url = `https://${DOMAIN}/url1`
      const linkedData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Menpants",
            item: "https://es.shein.com/category/Menpants-sc-008113048.html",
          },
        ],
      }
      const content = `<script type="application/ld+json">${JSON.stringify(
        linkedData,
      )}</script>`
      response.mockResolvedValueOnce(content)

      const result = await crawler.getContent(url)

      expect(result).toStrictEqual({
        url,
        linkedData: [linkedData],
      })
    })
  })
})
