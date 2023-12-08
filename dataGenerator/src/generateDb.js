const { mkdir } = require("fs/promises")
const Crawler = require("./Crawler")
const Indexer = require("./Indexer")

const SHOPS = [
  {
    name: "Decathlon",
    icon: "https://www.decathlon.es/render/android-icon-192x192.47c610ae67c1b1bdc694.png",
    domain: "www.decathlon.es",
  },
  {
    name: "Stradivarius",
    icon: "https://www.stradivarius.com/front/static/itxwebstandard/images/favicon-32x32.png",
    domain: "www.stradivarius.com",
  },
  {
    name: "H&M",
    icon: "https://www2.hm.com/etc.clientlibs/settings/wcm/designs/hm/clientlibs/shared/resources/favicon/favicon.ico",
    domain: "www2.hm.com",
  },
  {
    name: "Asos",
    icon: "https://www.asos.com/favicon-32x32.png",
    domain: "www.asos.com",
  },
  {
    name: "Primark",
    icon: "https://www.primark.com/favicon.ico",
    domain: "www.primark.com",
  },
  {
    name: "Springfield",
    icon: "https://myspringfield.com/on/demandware.static/Sites-SPF-Site/-/default/dw531e4368/img/favicon/favicon-96x96.png",
    domain: "myspringfield.com",
  },
  {
    name: "Nike",
    icon: "https://www.nike.com/android-icon-192x192.png",
    domain: "www.nike.com",
  },
  {
    name: "Levi's",
    icon: "https://www.levi.com/ngsa/img/corpLogos/LevisLogo.png",
    domain: "www.levi.com",
  },
  {
    name: "JD Sports",
    icon: "https://www.jdsports.es/skins/jdsports-desktop/public/img/icons/app/favicon.ico",
    domain: "www.jdsports.es",
  },
  {
    name: "Decimas",
    icon: "https://www.decimas.com/static/favicon.ico",
    domain: "www.decimas.com",
  },
  {
    name: "Cortefiel",
    icon: "https://cortefiel.com/on/demandware.static/Sites-CTF-Site/-/default/dw9250384f/img/favicon/favicon-96x96.png",
    domain: "cortefiel.com",
  },
  {
    name: "Bershka",
    icon: "https://www.bershka.com/favicons/android-chrome-192x192.png",
    domain: "www.bershka.com",
  },
  {
    name: "Algo Bonit",
    icon: "https://algo-bonito.com/cdn/shop/files/logo_32x32.png",
    domain: "algo-bonito.com",
  },

  // og only
  // deportesmoya.es
  // www.barrabes.com
  // shop.mango.com
  // pepco.es
  // www.thenorthface.es
  // www.valecuatro.com

  // Very aggresive captcha
  // {
  //   name: "Shein",
  //   icon: "https://sheinsz.ltwebstatic.com/she_dist/images/touch-icon-ipad-144-47ceee2d97.png",
  //   domain: "es.shein.com",
  // },
  // No sitemap in robots.txt
  // {
  //   name: "Zalando",
  //   icon: "https://mosaic02.ztat.net/rnd/ng/zalando-app-touch-icon-180-v1.png",
  //   domain: "www.zalando.es",
  // },
  // Sitemap is compressed
  // {
  //   name: "Zara",
  //   icon: "https://static.zara.net/stdstatic/5.20.0//images/favicon-32x32.png",
  //   domain: "www.zara.com",
  // },
  // "nil" robots.txt
  // {
  //   name: "Miravia",
  //   icon: "https://img.mrvcdn.com/us/media/7bada92e11dd275f27772c5ee02194ae.png",
  //   domain: "www.miravia.es",
  // }
  // www.c-and-a.com/ // no robots.txt
  // www.in-gravity.com // no jsonld no og
  // www.amazon.es // sitemap is compressed
  // www.sfera.com // no jsonld no good og
]

const PRODUCT_TOKEN = "Tangledrip/0.2"
const WHITE_KEYWORDS = ["pants", "trousers", "pantalon"]
const BLACK_KEYWORDS = [
  "/category/", "/sale/", "/hotsale/", "/new/", "/style/",
  "/trends/",
]
const CRAWL_DELAY = 10000

const main = async (domain, dataFolder, limit) => {
  const loggingPath = `${dataFolder}/${domain}`
  await mkdir(loggingPath, { recursive: true })

  const crawler = Crawler(domain, {
    productToken: PRODUCT_TOKEN,
    loggingPath,
    crawlDelay: CRAWL_DELAY,
  })
  const indexer = Indexer(SHOPS)

  console.log("[")

  let productsLogged = 0
  for await (const url of crawler.getAllowedUrls()) {
    if (!WHITE_KEYWORDS.some((key) => url.includes(key)) || BLACK_KEYWORDS.some(key => url.includes(key))) {
      continue
    }

    const content = await crawler.getContent(url)
    if(indexer.isProductPage(content)) {
      const product = indexer.createProduct(content)
      console.log(`${JSON.stringify(product)},`)

      productsLogged += 1
      if (limit && productsLogged >= limit) {
        break
      }
    }
  }

  console.log("]")
}

main(process.argv[2], process.argv[3], process.argv[4])
