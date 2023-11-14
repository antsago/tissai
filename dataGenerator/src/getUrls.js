const robotsParser = require('robots-parser')
const { parseStringPromise: parseXml } = require('xml2js')

const AGENT_TOKEN = 'Wibnix/1.0'

const robotsTxt = async (domain) => {
  const robotsUrl = `https://${domain}/robots.txt`
  const response = await fetch(robotsUrl)
  const robotsText = await response.text()

  return robotsParser(robotsUrl, robotsText)
}

const sitemap = async (sitemapUrl) => {
  const response = await fetch(sitemapUrl)
  const text = await response.text()
  return parseXml(text)  
}

const getUrls = async (domain) => {
  try {
    const robots = await robotsTxt(domain)

    const sitexmls = await Promise.all(robots.getSitemaps().filter(url => robots.isAllowed(url, AGENT_TOKEN)).map(sitemap))

    const sitemaps = await Promise.all(sitexmls.map(xml => !xml.sitemapindex ? xml : xml.sitemapindex.sitemap.map(site => sitemap(site.loc[0]))).flat())

    return sitemaps.map(sitemap => sitemap.urlset.url.map(url => url.loc[0])).flat().filter(url => robots.isAllowed(url, AGENT_TOKEN))
  } catch {
    return []
  }
}

module.exports = getUrls
