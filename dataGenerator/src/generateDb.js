const { mkdir } = require("fs/promises")
const Crawler = require("./Crawler")

const PRODUCT_TOKEN = "Wibnix/0.1"

const main = async (domain, dataFolder) => {
  const loggingPath = `${dataFolder}/${domain}`
  await mkdir(loggingPath)

  const crawler = Crawler(domain, { productToken: PRODUCT_TOKEN, loggingPath, crawlDelay: 100 })

  for await (const url of crawler.getAllowedUrls()) {
    console.log(url)
  }
}

main(process.argv[2], process.argv[3])
