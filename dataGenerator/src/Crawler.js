const Parser = require("./Parser")

const Crawler = function (domain, productToken) {
  const parse = new Parser(productToken)
  const get = async (url) => {
    return fetch(url, { headers: { UserAgent: productToken } })
  }

  const getRobots = async () => {
    const robotsUrl = `https://${domain}/robots.txt`
    const response = await get(robotsUrl)

    return parse.robots(response)
  }

  let robots
  const getSitemap = async (url) => {
    if (!robots.isAllowed(url)) {
      throw new Error(`Url ${url} not allowed`)
    }
    const response = await get(url)
    const site = await parse.sitexml(response)

    if (site.isSitemap) {
      return [site]
    }

    if (site.isSiteindex) {
      return getSitemaps(site.sitemaps)
    }

    throw new Error(`Result is neither a sitemap nor a siteindex:\n${site}`)
  }

  const getSitemaps = async (urls) => {
    return (await Promise.allSettled(urls.map(getSitemap)))
      .filter((result) => result.status === 'fulfilled')
      .map(result => result.value)
      .flat()
  }

  return {
    getAllowedUrls: async () => {
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
    },
  }
}

module.exports = Crawler
