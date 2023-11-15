const robotsParser = require('robots-parser')
const { parseStringPromise: xmlParser } = require('xml2js')

const Robots = function (url, text, productToken) {
  const robots = robotsParser(url, text)
  
  return {
    get sitemaps() {
      return robots.getSitemaps()
    },
    isAllowed: (url) => robots.isAllowed(url, productToken)
  }
}

const Sitexml = async function (text) {
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

const Parser = function (productToken) {
  return {
    robots: (url, text) => Robots(url, text, productToken),
    sitexml: async (text) => await Sitexml(text)
  }
}

module.exports = Parser
