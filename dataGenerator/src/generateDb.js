const Crawler = require("./Crawler")

// const DOMAIN = "es.shein.com"
const DOMAIN = "www.decathlon.es"
const PRODUCT_TOKEN = "Wibnix/0.1"

const main = async () => {
  for await (const url of Crawler(DOMAIN, PRODUCT_TOKEN).getAllowedUrls()) {
    console.log(url)
  }
}

main()
