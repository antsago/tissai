const Crawler = require("./Crawler")
const SHOPS = require("./shops")

const PRODUCT_TOKEN = "Wibnix/0.2"
const PRODUCT_KEYWORDS = [
  "pants",
  "trousers",
  "pantalon",
  "jean",
  "vaqueros",
  "joggers",
]
const CRAWL_DELAY = 10000

const main = async (dataFolder, limit) => {
  const crawler = await Crawler(SHOPS[0], {
    productToken: PRODUCT_TOKEN,
    dataFolder,
    crawlDelay: CRAWL_DELAY,
  })

  console.log("[")
  for await (const product of crawler.getProducts({ keywords: PRODUCT_KEYWORDS, limit })) {
    console.log(`${JSON.stringify(product)},`)
  }
  console.log("]")
}

main(process.argv[2], process.argv[3])
