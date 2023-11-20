const Robots = require("./Robots")
const Sitexml = require("./Sitexml")

const Crawler = function (domain, productToken) {
  let robots
  const get = async (url) => {
    if (robots && !robots.isAllowed(url)) {
      throw new Error(`Url ${url} not allowed`)
    }
    return fetch(url, { headers: { UserAgent: productToken } })
  }

  const getRobots = async () => {
    const robotsUrl = `https://${domain}/robots.txt`
    const response = await get(robotsUrl)

    return Robots(response.url, await response.text(), productToken)
  }

  const getSitemap = async (url) => {
    const response = await get(url)
    const site = await Sitexml(await response.text())

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
