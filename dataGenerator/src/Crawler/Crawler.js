const Domain = require("./Domain")
const Indexer = require("./Indexer")
const { Content } = require("./parsers")

const Crawler = async function (shop, crawlOptions) {
  const domain = await Domain(shop, crawlOptions)

  const getAllowedUrls = async function* () {
    for await (const sitemap of domain.getSitemaps()) {
      yield* sitemap.urls.filter((url) => domain.robots.isAllowed(url))
    }
  }

  const getContent = async function (url) {
    const response = await domain.fetch(url)
    return Content(response.url, response.body)
  }

  const getProducts = async function* ({ keywords, limit } = {}) {
    const indexer = Indexer([shop])

    let productsCreated = 0
    for await (const url of getAllowedUrls()) {
      if (keywords && !keywords.some(key => url.includes(key))) {
        continue
      }

      const content = await getContent(url)

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
    getAllowedUrls,
    getContent,
    getProducts,
  }
}

module.exports = Crawler
