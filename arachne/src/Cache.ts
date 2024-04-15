import { readdir, readFile } from "fs/promises"

const Cache = function (cacheFolder: string) {
  const get = async (url: string) => {
    const cached = await readdir(cacheFolder)
    const result = await readFile(`${cacheFolder}/${cached[0]}`, {
      encoding: "utf8",
    })
    return JSON.parse(result)
  }
  
  return { get }
}

export default Cache
