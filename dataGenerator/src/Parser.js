const robotsParser = require('robots-parser')
const { parseStringPromise: xmlParser } = require('xml2js')

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
      const parsedXml = await xmlParser(text, { strict: true })

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

module.exports = Parser
