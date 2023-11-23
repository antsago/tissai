const { setTimeout } = require("timers/promises")
const { writeFile } = require("fs/promises")

const Semaphore = function (crawlDelay) {
  const queue = []
  const runNext = () => {
    queue[0]()
  }

  return {
    acquire: async () => {
      const lock = new Promise((res) => queue.push(res))

      if (queue.length === 1) {
        runNext()
      }

      return lock
    },
    release: () => {
      queue.splice(0, 1)
      if (queue.length > 0) {
        setTimeout(crawlDelay).then(runNext)
      }
    },
  }
}

const Fetcher = function (productToken, loggingPath, crawlDelay) {
  const semaphore = Semaphore(crawlDelay)

  return async (url) => {
    await semaphore.acquire()
    const response = await fetch(url, { headers: { UserAgent: productToken } })
    semaphore.release()

    const result = {
      url: response.url,
      status: response.status,
      body: await response.text(),
      headers: Object.fromEntries(response.headers.entries()),
    }

    writeFile(`${loggingPath}/${Date.now()}@${encodeURIComponent(url)}`, JSON.stringify(result))
    
    return result
  }
}

module.exports = Fetcher
