const { appendFile } = require("fs/promises")
const Cache = require("./Cache")
const Fetcher = require("./Fetcher")
const { Robots, Sitexml } = require("./parsers")

const Domain = async function (
  shop,
  { productToken, crawlDelay = 100, loggingPath },
) {
  const get = Fetcher(productToken, Cache(loggingPath), crawlDelay)
  const fetchRobots = async () => {
    const robotsUrl = `https://${shop.domain}/robots.txt`
    const response = await get(robotsUrl)
    return Robots(response.url, response.body, productToken)
  }

  const robots = await fetchRobots()

  const fetchUrl = async (url) => {
    if (!robots.isAllowed(url)) {
      throw new Error(`Url ${url} not allowed`)
    }

    try {
      return await get(url)
    } catch (err) {
      await appendFile(
        `${loggingPath}/errors.log`,
        `${JSON.stringify({
          timestamp: Date.now(),
          url,
          message: err.message,
        })}\n`,
      )
      throw err
    }
  }

  const fetchSitemap = async function* (url) {
    try {
      const response = await fetchUrl(url)
      const site = await Sitexml(response.body)

      if (site.isSitemap) {
        return yield site
      }
      if (site.isSiteindex) {
        return yield* fetchSitemaps(site.sitemaps)
      }

      throw new Error(`Result is neither a sitemap nor a siteindex:\n${site}`)
    } catch (e) {
      return
    }
  }

  const fetchSitemaps = async function* (urls) {
    for (const url of urls) {
      yield* fetchSitemap(url)
    }
  }

  const getSitemaps = () => {
    const sitemaps = shop.sitemaps ?? robots.sitemaps
    return fetchSitemaps(sitemaps)
  }

  return {
    fetch: fetchUrl,
    robots,
    getSitemaps,
  }
}

module.exports = Domain
