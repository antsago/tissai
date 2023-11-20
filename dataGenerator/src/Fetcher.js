const { setTimeout } = require("timers/promises")

const Semaphore = function (timeoutMs = 100) {
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
        setTimeout(timeoutMs).then(runNext)
      }
    },
  }
}

const Fetcher = function (productToken, crawlDelay) {
  const semaphore = Semaphore(crawlDelay)

  return async (url) => {
    await semaphore.acquire()
    const response = await fetch(url, { headers: { UserAgent: productToken } })
    semaphore.release()

    return {
      url: response.url,
      body: await response.text(),
      status: response.status,
    }
  }
}

module.exports = Fetcher
