const { mkdir } = require("fs/promises")
const Crawler = require("./Crawler")
const Indexer = require("./Indexer")
const SHOPS = require("./shops")

const PRODUCT_TOKEN = "Wibnix/0.2"
const WHITE_KEYWORDS = [
  "pants",
  "trousers",
  "pantalon",
  "jean",
  "vaqueros",
  "joggers",
]
const BLACK_KEYWORDS = []
const CRAWL_DELAY = 10000

const main = async (domain, dataFolder, limit) => {
  const loggingPath = `${dataFolder}/${domain}`
  await mkdir(loggingPath, { recursive: true })

  const crawler = Crawler(domain, {
    productToken: PRODUCT_TOKEN,
    loggingPath,
    crawlDelay: CRAWL_DELAY,
  })
  const indexer = Indexer(SHOPS)

  console.log("[")

  let productsLogged = 0
  for await (const url of crawler.getAllowedUrls()) {
    if (
      !WHITE_KEYWORDS.some((key) => url.includes(key)) ||
      BLACK_KEYWORDS.some((key) => url.includes(key))
    ) {
      continue
    }

    const content = await crawler.getContent(url)
    if (indexer.isProductPage(content)) {
      const product = indexer.createProduct(content)
      console.log(`${JSON.stringify(product)},`)

      productsLogged += 1
      if (limit && productsLogged >= limit) {
        break
      }
    }
  }

  console.log("]")
}

main(process.argv[2], process.argv[3], process.argv[4])
