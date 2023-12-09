const { writeFile, readdir, readFile, mkdir } = require("fs/promises")
const { createHash } = require("node:crypto")

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

const Cache = async function (loggingPath) {
  await mkdir(loggingPath, { recursive: true })

  const get = async (url) => {
    const cachedResponses = (await readdir(loggingPath)).sort().reverse()
    const encodedUrl = encodePath(url)
    const cached = cachedResponses.filter((res) => res.includes(encodedUrl))
    if (!cached.length) {
      return undefined
    }

    const result = await readFile(`${loggingPath}/${cached[0]}`, {
      encoding: "utf8",
    })
    return JSON.parse(result)
  }

  const set = async (url, response) => {
    const encodedUrl = encodePath(url)
    await writeFile(
      `${loggingPath}/${Date.now()}@${encodedUrl}`,
      JSON.stringify(response),
    )
  }

  return {
    get,
    set,
  }
}

module.exports = Cache
