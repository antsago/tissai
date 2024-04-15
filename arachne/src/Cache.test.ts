import { readdir, readFile } from "fs/promises"
import { expect, describe, it, vi, beforeEach } from 'vitest'
import Cache from './Cache.js'

const CACHE_FOLDER = "./foo"
const URL = "www.example.com"
const CACHED_RESPONSE = {
  url: "/url",
  status: 200,
  body: "foobar",
  headers: { "content-type": "text/xml" },
}

vi.mock("fs/promises")

describe('Cache', () => {
  let cache: ReturnType<typeof Cache>
  beforeEach(() => {
    vi.clearAllMocks()

    cache = Cache(CACHE_FOLDER)
  })

  it("reuses cached responses", async () => {
    vi.mocked(readdir).mockResolvedValue([URL as any])
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(CACHED_RESPONSE))

    const result = await cache.get(URL)

    expect(result).toEqual(CACHED_RESPONSE)
    expect(readFile).toHaveBeenCalledWith(`${CACHE_FOLDER}/${URL}`, {
      encoding: "utf8",
    })
  })

  it("returns undefined if no cached response", async () => {
    vi.mocked(readdir).mockResolvedValue([])

    const result = await cache.get("new.url")

    expect(result).toEqual(undefined)
  })

  it("favours latest responses", async () => {
    const oldestResponse = `170075305761@${URL}`
    const latestResponse = `170075305762@${URL}`
    vi.mocked(readdir).mockResolvedValue([
      oldestResponse,
      latestResponse,
      oldestResponse,
    ] as any[])
    vi.mocked(readFile).mockResolvedValue("{}")

    await cache.get(URL)

    expect(readFile).toHaveBeenCalledWith(
      `${CACHE_FOLDER}/${latestResponse}`,
      expect.anything(),
    )
  })

  it("reads encoded urls", async () => {
    const url = "https://www.example.com/b-@r"
    const path = "170075305762@https%3A%2F%2Fwww.example.com%2Fb-%40r"
    vi.mocked(readdir).mockResolvedValue([path as any])
    vi.mocked(readFile).mockResolvedValue("{}")

    await cache.get(url)

    expect(readFile).toHaveBeenCalledWith(`${CACHE_FOLDER}/${path}`, expect.anything())
  })

  it("reads trimmed filenames", async () => {
    const longUrl =
      "https://es.shein.com/A-multi-purpose-large-capacity-clothes-hanger-and-trousers-rack-that-does-not-take-up-space.-One-clothes-hanger-and-trousers-rack-can-hang-4-layers-of-trousers,-6-layers-of-trousers,-and-8-layers-of-trousers.-Super-space-saving-p-26369719-cat-7166.html"
    const path = `170075305762@https%3A%2F%2Fes.shein.com%2FA-multi-purpose-large-capacity-clothes-hanger-and-trousers-rack-that-does-not-take-up-space.-One-clothes-hanger-and-trous2bac94693b9320267853652cd171d112`
    vi.mocked(readdir).mockResolvedValue([path as any])
    vi.mocked(readFile).mockResolvedValue("{}")

    await cache.get(longUrl)

    expect(readFile).toHaveBeenCalledWith(`${CACHE_FOLDER}/${path}`, expect.anything())
  })
})
