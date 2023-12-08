const Domain = require("./Domain")
const { Content } = require("./parsers")

const Crawler = async function (
  shop,
  options,
) {
  const domain = await Domain(shop, options)

  const getAllowedUrls = async function* () {
    for await (const sitemap of domain.getSitemaps()) {
      yield* sitemap.urls.filter((url) => domain.robots.isAllowed(url))
    }
  }

  const getContent = async function (url) {
    const response = await domain.fetch(url)
    return Content(response.url, response.body)
  }

  return {
    getAllowedUrls,
    getContent,
  }
}

module.exports = Crawler
