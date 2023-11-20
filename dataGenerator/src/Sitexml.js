const { parseStringPromise: xmlParser } = require("xml2js")

const Sitexml = async function (text) {
  const parsedXml = await xmlParser(text, { strict: true })

  return {
    /* For siteindexes */
    get isSiteindex() {
      return !!parsedXml.sitemapindex
    },
    get sitemaps() {
      return parsedXml.sitemapindex?.sitemap?.map(
        (sitemap) => sitemap?.loc?.[0],
      )
    },
    /* For sitemaps */
    get isSitemap() {
      return !!parsedXml.urlset
    },
    get urls() {
      return parsedXml.urlset?.url?.map((url) => url?.loc?.[0])
    },
  }
}

module.exports = Sitexml
