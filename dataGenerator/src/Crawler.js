const Fetcher = require("./Fetcher")
const parse = require("./parsers")

const Crawler = function (
  shop,
  { productToken, crawlDelay = 100, loggingPath },
) {
  const domain = shop.domain
  const get = Fetcher(productToken, loggingPath, crawlDelay)

  const getRobots = async () => {
    const robotsUrl = `https://${domain}/robots.txt`
    const response = await get(robotsUrl)
    return parse.Robots(response.url, response.body, productToken)
  }

  let robots
  const getSitemap = async function* (url) {
    try {
      if (robots && !robots.isAllowed(url)) {
        throw new Error(`Url ${url} not allowed`)
      }

      const response = await get(url)
      const site = await parse.Sitexml(response.body)

      if (site.isSitemap) {
        return yield site
      }
      if (site.isSiteindex) {
        return yield* getSitemaps(site.sitemaps)
      }

      throw new Error(`Result is neither a sitemap nor a siteindex:\n${site}`)
    } catch (e) {
      return
    }
  }

  const getSitemaps = async function* (urls) {
    for (const url of urls) {
      yield* getSitemap(url)
    }
  }

  const getAllowedUrls = async function* () {
    robots = await getRobots(domain)
    const sitemaps = shop.sitemaps ?? robots.sitemaps

    for await (const sitemap of getSitemaps(sitemaps)) {
      yield* sitemap.urls.filter((url) => robots.isAllowed(url))
    }
  }

  const getContent = async function (url) {
    const response = await get(url)
    return parse.Content(response.url, response.body)
  }

  return {
    getAllowedUrls,
    getContent,
  }
}

module.exports = Crawler
