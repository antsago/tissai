import { readdir, readFile } from "fs/promises"
import { createHash } from "node:crypto"

let fs = { readdir, readFile }
export function setFs(mock: typeof fs) {
  fs = mock
}

const encodePath = (url: string, maxLength: number) => {
  const encoded = encodeURIComponent(url)

  if (encoded.length <= maxLength) {
    return encoded
  }

  const pruned = encoded.slice(0, maxLength)
  const trim = encoded.slice(maxLength)
  const checksum = createHash("md5").update(trim).digest("hex")
  return `${pruned}${checksum}`
}

export const Cache = function (cacheFolder: string, maxPathLength = 150) {
  const get = async (url: string) => {
    const cachedResponses = (await fs.readdir(cacheFolder)).sort().reverse()

    const encodedUrl = encodePath(url, maxPathLength)
    console.log(encodedUrl)
    const cached = cachedResponses.filter((res) => res.includes(encodedUrl))
    if (!cached.length) {
      return undefined
    }

    const result = await fs.readFile(`${cacheFolder}/${cached[0]}`, {
      encoding: "utf8",
    })
    return JSON.parse(result)
  }
  
  return { get }
}
export type Cache = ReturnType<typeof Cache>
