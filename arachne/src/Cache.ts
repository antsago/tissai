import { readdir, readFile } from "fs/promises"
import { createHash } from "node:crypto"

const MAX_PATH_LENGTH = 150
const encodePath = (url: string) => {
  const encoded = encodeURIComponent(url)

  if (encoded.length <= MAX_PATH_LENGTH) {
    return encoded
  }

  const pruned = encoded.slice(0, MAX_PATH_LENGTH)
  const trim = encoded.slice(MAX_PATH_LENGTH)
  const checksum = createHash("md5").update(trim).digest("hex")
  return `${pruned}${checksum}`
}

const Cache = function (cacheFolder: string) {
  const get = async (url: string) => {
    const cachedResponses = (await readdir(cacheFolder)).sort().reverse()

    const encodedUrl = encodePath(url)
    const cached = cachedResponses.filter((res) => res.includes(encodedUrl))
    if (!cached.length) {
      return undefined
    }

    const result = await readFile(`${cacheFolder}/${cached[0]}`, {
      encoding: "utf8",
    })
    return JSON.parse(result)
  }
  
  return { get }
}

export default Cache
