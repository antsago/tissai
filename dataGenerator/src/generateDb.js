const getUrls = require("./Crawler")

// const DOMAINS = ['www.decathlon.es', "es.shein.com"]
const DOMAINS = ["es.shein.com"]

const main = async () => {
  const urls = await Promise.all(DOMAINS.map((domain) => getUrls(domain)))
  console.log(JSON.stringify(urls))
}

main()
