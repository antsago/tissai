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

const logShop = async (shop, dataFolder, limit) => {
  const crawler = await Crawler([shop], {
    productToken: PRODUCT_TOKEN,
    dataFolder,
    crawlDelay: CRAWL_DELAY,
  })
  
  for await (const product of crawler.getProducts({
    keywords: PRODUCT_KEYWORDS,
    limit,
  })) {
    console.log(`${JSON.stringify(product)},`)
  }
}

const main = async (dataFolder, limit) => {
  console.log("[")
  await Promise.all(SHOPS.map(shop => logShop(shop, dataFolder, limit)))
  console.log("]")
}

main(process.argv[2], process.argv[3])
