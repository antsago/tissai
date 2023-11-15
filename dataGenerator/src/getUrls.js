const robotsParser = require('robots-parser')
const { Parser: XmlParser } = require('xml2js')

const AGENT_TOKEN = 'Wibnix/1.0'
const headers = { UserAgent: AGENT_TOKEN }
const xmlParser = new XmlParser()

const Parser = function (productToken) {
  return {
    robots: (url, text) => {
      const robots = robotsParser(url, text)

      return {
        get sitemaps() {
          return robots.getSitemaps()
        },
        isAllowed: (url) => robots.isAllowed(url, productToken)
      }
    },
    sitexml: async (text) => {
      const parsedXml = await xmlParser.parseStringPromise(text)

      return {
        /* For siteindexes */
        get isSiteindex () {
          return !!parsedXml.sitemapindex
        },
        get sitemaps () {
          return parsedXml.sitemapindex?.sitemap?.map(sitemap => sitemap?.loc?.[0])
        },
        /* For sitemaps */
        get urls () {
          return parsedXml.urlset?.url?.map(url => url?.loc?.[0])
        }
      }
    }
  }
}

const parse = new Parser(AGENT_TOKEN)

const robotsTxt = async (domain) => {
  const robotsUrl = `https://${domain}/robots.txt`
  const response = await fetch(robotsUrl, { headers })
  const robotsText = await response.text()

  return parse.robots(robotsUrl, robotsText)
}

const sitemap = async (sitemapUrl) => {
  try {
    const response = await fetch(sitemapUrl, { headers })
    const text = await response.text()
    return parse.sitexml(text)
  } catch {
    return {}
  }
}

const getUrls = async (domain) => {
  try {
    const robots = await robotsTxt(domain)

    const sitexmls = await Promise.all(robots.sitemaps.filter(url => robots.isAllowed(url)).map(sitemap))

    const sitemaps = await Promise.all(sitexmls.map(xml => !xml.isSiteindex ? xml : xml.sitemaps.map(url => sitemap(url))).flat())

    return sitemaps.map(site => site.urls).flat().filter(url => url && robots.isAllowed(url))
  } catch {
    return []
  }
}

module.exports = getUrls
