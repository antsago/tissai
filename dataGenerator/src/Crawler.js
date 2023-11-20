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
  const getSitemap = async (sitemapUrl) => {
    if (!robots.isAllowed(sitemapUrl)) {
      throw new Error(`Url ${sitemapUrl} not allowed`)
    }
    const response = await get(sitemapUrl)
    return await parse.sitexml(response)
  }

  return {
    getAllowedUrls: async () => {
      try {
        robots = await getRobots(domain)

        const sitexmls = (await Promise.allSettled(robots.sitemaps.map(getSitemap)))
          .filter((result) => result.status === 'fulfilled')
          .map(result => result.value)

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
