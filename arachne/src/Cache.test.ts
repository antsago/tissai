import { expect, describe, it, vi, beforeEach } from 'vitest'
import type { MockedObject } from 'vitest'
import Cache, { setFs } from './Cache.js'

const CACHE_FOLDER = "./foo"
const URL = "www.example.com"
const CACHED_RESPONSE = {
  url: "/url",
  status: 200,
  body: "foobar",
  headers: { "content-type": "text/xml" },
}

describe('Cache', () => {
  let fake: MockedObject<Parameters<typeof setFs>[0]>
  let cache: ReturnType<typeof Cache>
  beforeEach(() => {
    fake = {
      readdir: vi.fn(),
      readFile: vi.fn(),
    } as any
    setFs(fake)

    cache = Cache(CACHE_FOLDER)
  })

  it("reuses cached responses", async () => {
    fake.readdir.mockResolvedValue([URL as any])
    fake.readFile.mockResolvedValue(JSON.stringify(CACHED_RESPONSE))

    const result = await cache.get(URL)

    expect(result).toEqual(CACHED_RESPONSE)
    expect(fake.readFile).toHaveBeenCalledWith(`${CACHE_FOLDER}/${URL}`, {
      encoding: "utf8",
    })
  })

  it("returns undefined if no cached response", async () => {
    fake.readdir.mockResolvedValue([])

    const result = await cache.get("new.url")

    expect(result).toEqual(undefined)
  })

  it("favours latest responses", async () => {
    const oldestResponse = `170075305761@${URL}`
    const latestResponse = `170075305762@${URL}`
    fake.readdir.mockResolvedValue([
      oldestResponse,
      latestResponse,
      oldestResponse,
    ] as any[])
    fake.readFile.mockResolvedValue("{}")

    await cache.get(URL)

    expect(fake.readFile).toHaveBeenCalledWith(
      `${CACHE_FOLDER}/${latestResponse}`,
      expect.anything(),
    )
  })

  it("reads encoded urls", async () => {
    const url = "https://www.example.com/b-@r"
    const path = "170075305762@https%3A%2F%2Fwww.example.com%2Fb-%40r"
    fake.readdir.mockResolvedValue([path as any])
    fake.readFile.mockResolvedValue("{}")

    await cache.get(url)

    expect(fake.readFile).toHaveBeenCalledWith(`${CACHE_FOLDER}/${path}`, expect.anything())
  })

  it("reads trimmed filenames", async () => {
    const longUrl = "a.long.url"
    const path = `a.lonbb42eec98dbb99eb37f9ab21eea8767a`
    fake.readdir.mockResolvedValue([path as any])
    fake.readFile.mockResolvedValue("{}")
    
    await Cache(CACHE_FOLDER, 5).get(longUrl)
    
    expect(fake.readFile).toHaveBeenCalledWith(`${CACHE_FOLDER}/${path}`, expect.anything())
  })
})
