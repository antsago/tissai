const { mkdir } = require("fs/promises")
const Crawler = require("./Crawler")

const SHOPS = {
  DECATHLON: {
    name: "Decathlon",
    image: "https://www.decathlon.es/render/android-icon-192x192.47c610ae67c1b1bdc694.png",
    domain: "www.decathlon.es",
  },
  SHEIN: {
    name: "Shein",
    image: "https://sheinsz.ltwebstatic.com/she_dist/images/touch-icon-ipad-144-47ceee2d97.png",
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

const path = require("node:path")
const test = async function (dbPaths) {
  const products = dbPaths
    .map((dbPath) =>
      require(path.resolve(dbPath))
        .filter((product) =>
          product.linkedData.some(
            (data) =>
              data["@type"] === "Product" &&
              data["@context"] === "https://schema.org/",
          ),
        )
        .map((product) => {
          const linkedData = product.linkedData.find(
            (data) => data["@type"] === "Product",
          )

          return {
            name: linkedData.name,
            description: linkedData.description,
            image: Array.isArray(linkedData.image)
              ? linkedData.image[0]
              : linkedData.image,
            brand: linkedData.brand?.name,
            url: product.url,
          }
        }),
    )
    .flat()

  console.log(JSON.stringify(products))
}

test(process.argv.slice(2))
