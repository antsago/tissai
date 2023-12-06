const { setTimeout } = require("timers/promises")
const { writeFile, appendFile, readdir, readFile } = require("fs/promises")
const { createHash } = require("node:crypto")

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

const MAX_PATH_LENGTH = 150
const encodePath = (url) => {
  const encoded = encodeURIComponent(url)

  if (encoded.length <= MAX_PATH_LENGTH) {
    return encoded
  }

  const pruned = encoded.slice(0, MAX_PATH_LENGTH)
  const trim = encoded.slice(MAX_PATH_LENGTH)
  const checksum = createHash("md5").update(trim).digest("hex")
  return `${pruned}${checksum}`
}

const Fetcher = function (productToken, loggingPath, crawlDelay) {
  const waitForGreen = Semaphore(crawlDelay)

  const retrieveFromSrc = async (url) => {
    await waitForGreen()
    const response = await fetch(url, { headers: {
      UserAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 ${productToken}`
    } })

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
      const encodedUrl = encodePath(url)
      const cached = cachedResponses.filter((res) => res.includes(encodedUrl))
      if (cached.length) {
        const result = await readFile(`${loggingPath}/${cached[0]}`, {
          encoding: "utf8",
        })
        return JSON.parse(result)
      }

      const result = await retrieveFromSrc(url)

      await writeFile(
        `${loggingPath}/${Date.now()}@${encodedUrl}`,
        JSON.stringify(result),
      )

      return result
    } catch (err) {
      await appendFile(
        `${loggingPath}/errors.log`,
        `${JSON.stringify({
          timestamp: Date.now(),
          url,
          message: err.message,
        })}\n`,
      )
      throw err
    }
  }
}

module.exports = Fetcher
