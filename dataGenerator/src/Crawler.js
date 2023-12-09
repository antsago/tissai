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

  const getProducts = async function* () {
    const indexer = Indexer([shop])
    for await (const url of getAllowedUrls()) {
      const content = await getContent(url)
      yield indexer.createProduct(content)
    }
  }

  return {
    getAllowedUrls,
    getContent,
    getProducts,
  }
}

module.exports = Crawler
