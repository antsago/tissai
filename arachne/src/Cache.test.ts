import { readdir, readFile } from "fs/promises"
import { expect, describe, it, vi } from 'vitest'
import Cache from './Cache.js'

const CACHE_FOLDER = "./foo"

vi.mock("fs/promises")

describe('Cache', () => {
  it("reuses cached responses", async () => {
    const cache = Cache(CACHE_FOLDER)
    const cached = {
      url: "/url",
      status: 200,
      body: "foobar",
      headers: { "content-type": "text/xml" },
    }
    const path = "1700753057613@https%3A%2F%2Fwww.example.com%2Fb-%40r"
    vi.mocked(readdir).mockResolvedValue([path as any])
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(cached))

    const result = await cache.get("https://www.example.com/b-@r")

    expect(result).toEqual(cached)
    expect(readFile).toHaveBeenCalledWith(`${CACHE_FOLDER}/${path}`, {
      encoding: "utf8",
    })
  })
})
