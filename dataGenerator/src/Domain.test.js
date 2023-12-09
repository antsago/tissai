const { readdir, appendFile } = require("fs/promises")
const Domain = require("./Domain")

jest.useFakeTimers()
jest.mock("fs/promises")

describe("Domain", () => {
  const DOMAIN = "example.com"
  const PRODUCT_TOKEN = "FooBar/1.0"
  const LOGGING_PATH = "./foo"

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

  it("fetches and caches robots.txt", async () => {
    const robotsTxt = `User-Agent: ${PRODUCT_TOKEN}\nDisallow:/url1`
    response.mockResolvedValueOnce(robotsTxt)

    const domain = await Domain(shop, {
      productToken: PRODUCT_TOKEN,
      loggingPath: LOGGING_PATH,
      crawlDelay: 1,
    })

    expect(domain.robots.isAllowed(`https://${DOMAIN}/url1`)).toBe(false)
    expect(response).toHaveBeenCalledTimes(1)
  })

  describe("fetch", () => {
    it("fetches requested url", async () => {
      const url1 = `https://${DOMAIN}/url1`
      const urlContent = "URL1 content"
      const robots = ""
      response.mockResolvedValueOnce(robots).mockResolvedValueOnce(urlContent)
      const domain = await Domain(shop, {
        productToken: PRODUCT_TOKEN,
        loggingPath: LOGGING_PATH,
        crawlDelay: 1,
      })

      const result = await domain.fetch(url1)

      expect(result).toStrictEqual(
        expect.objectContaining({
          url: url1,
          body: urlContent,
        }),
      )
    })

    it("rejects urls blocks by robots", async () => {
      const url1 = `https://${DOMAIN}/url1`
      const robots = `User-Agent: ${PRODUCT_TOKEN}\nDisallow:/url1`
      response.mockResolvedValueOnce(robots)
      const domain = await Domain(shop, {
        productToken: PRODUCT_TOKEN,
        loggingPath: LOGGING_PATH,
        crawlDelay: 1,
      })

      const act = domain.fetch(url1)

      await expect(act).rejects.toThrow()
    })

    it("logs errors", async () => {
      const error = new Error("Booh!")
      const robots = ""
      response.mockResolvedValueOnce(robots)
      const url = "https://www.example.com/b-@r"
      fetch
        .mockResolvedValueOnce({
          text: response,
          url,
          status: 200,
          headers: new Headers(),
        })
        .mockRejectedValueOnce(error)
      const domain = await Domain(shop, {
        productToken: PRODUCT_TOKEN,
        loggingPath: LOGGING_PATH,
        crawlDelay: 1,
      })

      const act = domain.fetch(url)

      await expect(act).rejects.toThrow(error)
      expect(appendFile).toHaveBeenCalledWith(
        `${LOGGING_PATH}/errors.log`,
        `${JSON.stringify({
          timestamp: Date.now(),
          url,
          message: error.message,
        })}\n`,
      )
    })
  })

  describe("getSitemaps", () => {
    const TEST_URL = `https://${DOMAIN}/url1`
    const SITEMAP = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>${TEST_URL}</loc></url>
      </urlset>
    `
    const SITEINDEX = `
      <?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap><loc>https://${DOMAIN}/sitemap.xml</loc></sitemap>
      </sitemapindex>
    `

    it("fetches sitemaps in robots", async () => {
      const robots = `Sitemap: https://${DOMAIN}/sitemap.xml`
      response.mockResolvedValueOnce(robots).mockResolvedValueOnce(SITEMAP)
      const domain = await Domain(shop, {
        productToken: PRODUCT_TOKEN,
        loggingPath: LOGGING_PATH,
        crawlDelay: 1,
      })

      const sitemap = (await domain.getSitemaps().next()).value

      expect(sitemap.urls).toStrictEqual([TEST_URL])
    })

    it("supports siteindexes", async () => {
      const robots = `Sitemap: https://${DOMAIN}/siteindex.xml`
      response
        .mockResolvedValueOnce(robots)
        .mockResolvedValueOnce(SITEINDEX)
        .mockResolvedValueOnce(SITEMAP)
      const domain = await Domain(shop, {
        productToken: PRODUCT_TOKEN,
        loggingPath: LOGGING_PATH,
        crawlDelay: 1,
      })

      const sitemap = (await domain.getSitemaps().next()).value

      expect(sitemap.urls).toStrictEqual([TEST_URL])
    })

    it("ignores disallowed sitemaps", async () => {
      const robots = `Sitemap: https://${DOMAIN}/sitemap.xml\nUser-Agent: ${PRODUCT_TOKEN}\nDisallow:/sitemap`
      response.mockResolvedValueOnce(robots).mockResolvedValueOnce(SITEMAP)
      const domain = await Domain(shop, {
        productToken: PRODUCT_TOKEN,
        loggingPath: LOGGING_PATH,
        crawlDelay: 1,
      })

      const firstIteration = await domain.getSitemaps().next()

      expect(firstIteration.done).toBe(true)
      expect(firstIteration.value).toBe(undefined)
    })

    it("ignores disallowed siteindex", async () => {
      const robots = `Sitemap: https://${DOMAIN}/siteindex.xml\nUser-Agent: ${PRODUCT_TOKEN}\nDisallow:/sitemap`
      response
        .mockResolvedValueOnce(robots)
        .mockResolvedValueOnce(SITEINDEX)
        .mockResolvedValueOnce(SITEMAP)
      const domain = await Domain(shop, {
        productToken: PRODUCT_TOKEN,
        loggingPath: LOGGING_PATH,
        crawlDelay: 1,
      })

      const firstIteration = await domain.getSitemaps().next()

      expect(firstIteration.done).toBe(true)
      expect(firstIteration.value).toBe(undefined)
    })

    it("ignores sitemaps and siteindex with retrieval errors", async () => {
      const robots = `Sitemap: https://${DOMAIN}/sitemap.xml`
      response
        .mockResolvedValueOnce(robots)
        .mockRejectedValueOnce(new Error("Booh!"))
      const domain = await Domain(shop, {
        productToken: PRODUCT_TOKEN,
        loggingPath: LOGGING_PATH,
        crawlDelay: 1,
      })

      const firstIteration = await domain.getSitemaps().next()

      expect(firstIteration.done).toBe(true)
      expect(firstIteration.value).toBe(undefined)
    })

    it("uses shop-defined sitemaps if present", async () => {
      shop.sitemaps = [`https://${DOMAIN}/sitemap.xml`]
      const robots = `Sitemap: https://${DOMAIN}/siteindex.xml`
      response.mockResolvedValueOnce(robots).mockResolvedValueOnce(SITEMAP)
      const domain = await Domain(shop, {
        productToken: PRODUCT_TOKEN,
        loggingPath: LOGGING_PATH,
        crawlDelay: 1,
      })

      await domain.getSitemaps().next()

      expect(fetch).toHaveBeenNthCalledWith(
        2,
        shop.sitemaps[0],
        expect.anything(),
      )
    })
  })
})
