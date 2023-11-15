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

  const getSitemap = async (sitemapUrl) => {
    try {
      const response = await get(sitemapUrl)
      return await parse.sitexml(response)
    } catch {
      return {}
    }
  }

  return {
    getAllowedUrls: async () => {
      try {
        const robots = await getRobots(domain)

        const sitexmls = await Promise.all(
          robots.sitemaps
            .filter((url) => robots.isAllowed(url))
            .map(getSitemap),
        )

        const sitemaps = await Promise.all(
          sitexmls
            .map((xml) =>
              !xml.isSiteindex
                ? xml
                : xml.sitemaps.map((url) => getSitemap(url)),
            )
            .flat(),
        )

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
