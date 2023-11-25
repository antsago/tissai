const { mkdir } = require("fs/promises")
const Crawler = require("./Crawler")

const PRODUCT_TOKEN = "Wibnix/0.1"

const main = async (domain, dataFolder) => {
  const loggingPath = `${dataFolder}/${domain}`
  await mkdir(loggingPath, { recursive: true })

  const crawler = Crawler(domain, {
    productToken: PRODUCT_TOKEN,
    loggingPath,
    crawlDelay: 100,
  })

  for await (const url of crawler.getAllowedUrls()) {
    if (url.includes("trousers")) {
      const content = await crawler.getContent(url)
      console.log(content)
    }
  }
}

// main(process.argv[2], process.argv[3])

const { JSDOM } = require("jsdom")
const Fetcher = require('./Fetcher')
const test = async function () {
  const get = Fetcher(PRODUCT_TOKEN, '../data/es.shein.com', 1)

  const response = await get('https://es.shein.com/BLACK-regular-trousers-p-24412344-cat-1740.html')

  const site = new JSDOM(response.body)
  const ld = [...site.window.document.querySelectorAll('script[type="application/ld+json"]')].map(tag => tag.text).map(JSON.parse)
  console.log(ld)
}

test()
