const Crawler = require("./Crawler")

const PRODUCT_TOKEN = "Wibnix/0.1"

const main = async (domain) => {
  for await (const url of Crawler(domain, PRODUCT_TOKEN).getAllowedUrls()) {
    console.log(url)
  }
}

main(process.argv[2])
