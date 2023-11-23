const { setTimeout } = require("timers/promises")
const { writeFile, appendFile, readdir, readFile } = require("fs/promises")

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

  const retrieveFromSrc = async (url) => {
    await semaphore.acquire()
    const response = await fetch(url, { headers: { UserAgent: productToken } })
    semaphore.release()
  
    return {
      url: response.url,
      status: response.status,
      body: await response.text(),
      headers: Object.fromEntries(response.headers.entries()),
    }
  }

  return async (url) => {
    try {
      const cachedResponses = (await readdir(loggingPath)).sort().reverse()
      const encodedUrl = encodeURIComponent(url)
      const cached = cachedResponses.filter(res => res.includes(encodedUrl))
      if (cached.length) {
        const result = await readFile(`${loggingPath}/${cached[0]}`)
        return JSON.parse(result)
      }

      const result = await retrieveFromSrc(url)

      await writeFile(`${loggingPath}/${Date.now()}@${encodedUrl}`, JSON.stringify(result))
      
      return result
    } catch (err) {
      await appendFile(`${loggingPath}/errors.log`, `${JSON.stringify({ timestamp: Date.now(), url, message: err.message })}\n`)
      throw err
    }
  }
}

module.exports = Fetcher
