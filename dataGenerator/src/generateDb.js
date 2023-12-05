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
  ZALANDO: {
    name: "Zalando",
    icon: "https://mosaic02.ztat.net/rnd/ng/zalando-app-touch-icon-180-v1.png",
    domain: "www.zalando.es",
  },
  ZARA: {
    name: "Zara",
    icon: "https://static.zara.net/stdstatic/5.20.0//images/favicon-32x32.png",
    domain: "www.zara.com",
  },
  IN_GRAVITY: {
    name: "Zara",
    icon: "https://static.zara.net/stdstatic/5.20.0//images/favicon-32x32.png",
    domain: "www.zara.com",
  },
  MIRAVIA: {
    name: "Miravia",
    icon: "https://img.mrvcdn.com/us/media/7bada92e11dd275f27772c5ee02194ae.png",
    domain: "www.miravia.es",
  }
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
const findHeaders = (node, path = []) => {
  if (!Array.isArray(node)) {
    if (node.type === "text" && node.headerLevel > 0) {
      return [{ ...node, path }]
    }
  
    return []
  }

  return node.flatMap((child, cIndex) => findHeaders(child, [...path, cIndex]))
}

const test = async function (dataFolder) {
  const domain = SHOPS.DECATHLON.domain
  const loggingPath = `${dataFolder}/${domain}`
  const crawler = Crawler(domain, {
    productToken: PRODUCT_TOKEN,
    loggingPath,
    crawlDelay: CRAWL_DELAY,
  })

  const content = await crawler.getContent(
    // "https://www.decathlon.es/es/p/mp/regatta/pantalones-repelentes-al-agua-new-action-para-mujer-negro/_/R-p-28a99149-5812-44f5-a6b9-6d36aec296aa",
    // "https://www.decathlon.es/es/p/camiseta-termica-interior-de-esqui-y-nieve-ninos-5-14-anos-wedze-ski-100/_/R-p-121230",
    // "https://es.shein.com/Young-Girl-Bow-Front-Overlap-Front-Sweatshirt-&-Sweatpants-p-24511225-cat-2115.html",
    "https://www.zalando.es/nike-performance-academy-23-track-suit-branded-chandal-blackwhite-n1242k083-q11.html",
  )

  const headers = findHeaders(content.html).sort((a, b) => a.headerLevel - b.headerLevel)
  return [headers, content]
}

test(process.argv[2])
