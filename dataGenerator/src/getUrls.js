const Parser = require('./Parser')

const AGENT_TOKEN = 'Wibnix/1.0'
const headers = { UserAgent: AGENT_TOKEN }

const parse = new Parser(AGENT_TOKEN)

const robotsTxt = async (domain) => {
  const robotsUrl = `https://${domain}/robots.txt`
  const response = await fetch(robotsUrl, { headers })

  return parse.robots(response, robotsUrl)
}

const sitemap = async (sitemapUrl) => {
  try {
    const response = await fetch(sitemapUrl, { headers })
    return await parse.sitexml(response)
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
