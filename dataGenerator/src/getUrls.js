const robotsParser = require('robots-parser')
const { parseStringPromise: parseXml } = require('xml2js')

const robotsTxt = async (domain) => {
  const robotsUrl = `https://${domain}/robots.txt`
  const response = await fetch(robotsUrl)
  const robotsText = await response.text()

  return robotsParser(robotsUrl, robotsText)
}

const getUrls = async (domain) => {
  try {
    const robots = await robotsTxt(domain)

    const sitemaps = await Promise.all(robots.getSitemaps().map(async sitemap => {
      const response = await fetch(sitemap)
      const text = await response.text()
      return parseXml(text)
    }))

    return sitemaps.map(sitemap => sitemap.urlset.url.map(url => url.loc[0])).flat()
  } catch {
    return []
  }
}

module.exports = getUrls
