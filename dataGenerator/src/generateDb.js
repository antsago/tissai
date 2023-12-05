const { mkdir } = require("fs/promises")
const Crawler = require("./Crawler")

const SHOPS = {
  DECATHLON: {
    name: "Decathlon",
    icon: "https://www.decathlon.es/render/android-icon-192x192.47c610ae67c1b1bdc694.png",
    domain: "www.decathlon.es",
  },
  SHEIN: {
    name: "Shein",
    icon: "https://sheinsz.ltwebstatic.com/she_dist/images/touch-icon-ipad-144-47ceee2d97.png",
    domain: "es.shein.com",
  },
}

const PRODUCT_TOKEN = "Wibnix/0.1"
const KEYWORDS = ["pants", "trousers", "pantalon"]
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
    if (!KEYWORDS.some((key) => url.includes(key))) {
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

// main(process.argv[2], process.argv[3], process.argv[4])

const test = async function (dataFolder) {
  const domain = SHOPS.DECATHLON.domain
  const loggingPath = `${dataFolder}/${domain}`
  const crawler = Crawler(domain, {
    productToken: PRODUCT_TOKEN,
    loggingPath,
    crawlDelay: CRAWL_DELAY,
  })

  const content = await crawler.getContent(
    "https://www.decathlon.es/es/p/mp/regatta/pantalones-repelentes-al-agua-new-action-para-mujer-negro/_/R-p-28a99149-5812-44f5-a6b9-6d36aec296aa",
  )

  console.log(`${JSON.stringify(content.html)}`)
  return content
}

test(process.argv[2])
