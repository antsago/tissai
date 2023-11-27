const { mkdir } = require("fs/promises")
const Crawler = require("./Crawler")

const PRODUCT_TOKEN = "Wibnix/0.1"
const KEYWORDS = ["trousers", "pantalon"]
const CRAWL_DELAY = 5000

const main = async (domain, dataFolder, limit) => {
  const loggingPath = `${dataFolder}/${domain}`
  await mkdir(loggingPath, { recursive: true })

  const crawler = Crawler(domain, {
    productToken: PRODUCT_TOKEN,
    loggingPath,
    crawlDelay: CRAWL_DELAY,
  })

  console.log("[")

  let productsLogged = 0
  for await (const url of crawler.getAllowedUrls()) {
    if (!KEYWORDS.some(key => url.includes(key))) {
      continue
    }

    const content = await crawler.getContent(url)
    console.log(`${JSON.stringify(content)},`)
    productsLogged += 1

    if (limit && productsLogged >= limit) {
      break
    }
  }

  console.log("]")
}

main(process.argv[2], process.argv[3], process.argv[4])
