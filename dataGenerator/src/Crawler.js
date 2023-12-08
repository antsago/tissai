const Fetcher = require("./Fetcher")
const parse = require("./parsers")

const Domain = async function (shop, { productToken, crawlDelay = 100, loggingPath }) {
  const get = Fetcher(productToken, loggingPath, crawlDelay)
  const getRobots = async () => {
    const robotsUrl = `https://${shop.domain}/robots.txt`
    const response = await get(robotsUrl)
    return parse.Robots(response.url, response.body, productToken)
  }
  
  const robots = await getRobots()

  const fetch = async (url) => {
    if (!robots.isAllowed(url)) {
      throw new Error(`Url ${url} not allowed`)
    }

    return get(url)
  }

  return {
    fetch,
    robots,
    get sitemaps () {
      return shop.sitemaps ?? robots.sitemaps
    }
  }
}

const Crawler = async function (
  shop,
  options,
) {
  const domain = await Domain(shop, options)

  const getSitemap = async function* (url) {
    try {
      const response = await domain.fetch(url)
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
    const sitemaps = getSitemaps(domain.sitemaps) 

    for await (const sitemap of sitemaps) {
      yield* sitemap.urls.filter((url) => domain.robots.isAllowed(url))
    }
  }

  const getContent = async function (url) {
    const response = await domain.fetch(url)
    return parse.Content(response.url, response.body)
  }

  return {
    getAllowedUrls,
    getContent,
  }
}

module.exports = Crawler
