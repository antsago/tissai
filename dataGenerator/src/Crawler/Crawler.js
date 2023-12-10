const Domain = require("./Domain")
const Indexer = require("./Indexer")
const { Content } = require("./parsers")

const Crawler = async function (shops, crawlOptions) {
  const indexer = Indexer(shops)

  const getAllowedUrls = async function* (domain) {
    for await (const sitemap of domain.getSitemaps()) {
      yield* sitemap.urls.filter((url) => domain.robots.isAllowed(url))
    }
  }

  const getContent = async function (domain, url) {
    const response = await domain.fetch(url)
    return Content(response.url, response.body)
  }

  const getProducts = async function* ({ keywords, limit } = {}) {
    const shop = shops[0]
    const domain = await Domain(shop, crawlOptions)

    let productsCreated = 0
    for await (const url of getAllowedUrls(domain)) {
      if ((keywords && !keywords.some((key) => url.includes(key)))
      || (shop.urlKeywords && !shop.urlKeywords.some((key) => url.includes(key)))) {
        continue
      }

      const content = await getContent(domain, url)

      if (!indexer.isProductPage(content)) {
        continue
      }

      yield indexer.createProduct(content)

      productsCreated += 1
      if (limit && productsCreated >= limit) {
        return
      }
    }
  }

  return {
    getProducts,
  }
}

module.exports = Crawler
