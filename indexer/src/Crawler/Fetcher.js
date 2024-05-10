const { setTimeout } = require("timers/promises")

const Semaphore = function (crawlDelay) {
  const queue = []

  let timeout
  const start = () => {
    if (!queue.length) {
      return
    }

    const [next] = queue.splice(0, 1)
    timeout = setTimeout(crawlDelay).then(() => {
      timeout = undefined
      start()
    })

    next()
  }

  return async function waitForGreen() {
    const lock = new Promise((res) => queue.push(res))

    if (!timeout) {
      start()
    }

    return lock
  }
}

const Fetcher = function (productToken, cache, crawlDelay) {
  const waitForGreen = Semaphore(crawlDelay)

  const retrieveFromSrc = async (url) => {
    await waitForGreen()
    const response = await fetch(url, {
      headers: {
        ["User-Agent"]: productToken,
      },
    })

    return {
      url: response.url,
      status: response.status,
      body: await response.text(),
      headers: Object.fromEntries(response.headers.entries()),
    }
  }

  return async (url) => {
    const cached = await cache.get(url)
    if (cached) {
      return cached
    }

    const result = await retrieveFromSrc(url)
    await cache.set(url, result)
    return result
  }
}

module.exports = Fetcher
