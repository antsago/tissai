const Fetcher = require("./Fetcher")
const Robots = require("./Robots")
const Sitexml = require("./Sitexml")

const Crawler = function (domain, productToken, timeoutMs = 100) {
  const get = Fetcher(productToken, timeoutMs)

  const getRobots = async () => {
    const robotsUrl = `https://${domain}/robots.txt`
    const response = await get(robotsUrl)

    return Robots(response.url, response.body, productToken)
  }

  let robots
  const getSitemap = async (url) => {
    if (robots && !robots.isAllowed(url)) {
      throw new Error(`Url ${url} not allowed`)
    }

    const response = await get(url)
    const site = await Sitexml(response.body)

    if (site.isSitemap) {
      return [site]
    }

    if (site.isSiteindex) {
      return getSitemaps(site.sitemaps)
    }

    throw new Error(`Result is neither a sitemap nor a siteindex:\n${site}`)
  }

  const getSitemaps = async function (urls) {
    return (await Promise.allSettled(urls.map(getSitemap)))
      .filter((result) => result.status === 'fulfilled')
      .map(result => result.value)
      .flat()
  }

  const getAllowedUrls = async function () {
    try {
      robots = await getRobots(domain)

      const sitemaps = await getSitemaps(robots.sitemaps)

      return sitemaps
        .map((site) => site.urls)
        .flat()
        .filter((url) => url && robots.isAllowed(url))
    } catch {
      return []
    }
  }

  return {
    getAllowedUrls,
    get,
  }
}

module.exports = Crawler
