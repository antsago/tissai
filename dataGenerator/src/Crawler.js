const Fetcher = require("./Fetcher")
const Robots = require("./Robots")
const Sitexml = require("./Sitexml")

const Crawler = function (domain, { productToken, crawlDelay = 100, loggingPath }) {
  const get = Fetcher(productToken, loggingPath, crawlDelay)

  const getRobots = async () => {
    const robotsUrl = `https://${domain}/robots.txt`
    const response = await get(robotsUrl)
    return Robots(response.url, response.body, productToken)
  }

  let robots
  const getSitemap = async function* (url) {
    try {
      if (robots && !robots.isAllowed(url)) {
        throw new Error(`Url ${url} not allowed`)
      }
  
      const response = await get(url)
      const site = await Sitexml(response.body)
  
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

    for await (const sitemap of getSitemaps(robots.sitemaps)) {
      yield* sitemap.urls.filter((url) => robots.isAllowed(url))
    }
  }

  const getContent = async function (url) {
    const response = await get(url)
    return response.body
  }

  return {
    getAllowedUrls,
    getContent,
  }
}

module.exports = Crawler
