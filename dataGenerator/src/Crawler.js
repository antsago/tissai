const { setImmediate, setTimeout } = require('timers/promises')
const Robots = require("./Robots")
const Sitexml = require("./Sitexml")

const Semaphore = function () {
  const queue = []
  const runNext = () => {
    console.log('runNext')
    queue[0]()
  }

  return {
    acquire: async () => {
      console.log('acquire')
      const lock = new Promise(res => queue.push(res))
      
      if (queue.length === 1) {
        console.log('jumpstart')
        runNext()
      }
      
      console.log('returning')
      return lock
    },
    release: () => {
      console.log('release')
      queue.splice(0, 1)
      if (queue.length) {
        setTimeout(0.1).then(runNext)
      }
    }
  }
}

const Crawler = function (domain, productToken) {
  let robots
  const semaphore = Semaphore()
  const get = async (url) => {
    if (robots && !robots.isAllowed(url)) {
      throw new Error(`Url ${url} not allowed`)
    }

    console.log(url, 'acquire')
    await semaphore.acquire()
    console.log(url, 'fetch')
    const response = fetch(url, { headers: { UserAgent: productToken } })
    console.log(url, 'release')
    semaphore.release()
    
    return response
  }

  const getRobots = async () => {
    const robotsUrl = `https://${domain}/robots.txt`
    const response = await get(robotsUrl)

    return Robots(response.url, await response.text(), productToken)
  }

  const getSitemap = async (url) => {
    const response = await get(url)
    const site = await Sitexml(await response.text())

    if (site.isSitemap) {
      return [site]
    }

    if (site.isSiteindex) {
      return getSitemaps(site.sitemaps)
    }

    throw new Error(`Result is neither a sitemap nor a siteindex:\n${site}`)
  }

  const getSitemaps = async (urls) => {
    return (await Promise.allSettled(urls.map(getSitemap)))
      .filter((result) => result.status === 'fulfilled')
      .map(result => result.value)
      .flat()
  }

  const getAllowedUrls = async () => {
    try {
      robots = await getRobots(domain)

      const sitemaps = await getSitemaps(robots.sitemaps)

      return sitemaps
        .map((site) => site.urls)
        .flat()
        .filter((url) => url && robots.isAllowed(url))
    } catch {
      return []
    }
  }

  return {
    getAllowedUrls,
    get,
  }
}

module.exports = Crawler
