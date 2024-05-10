const { writeFile, readdir, readFile, mkdir } = require("fs/promises")
const Cache = require("./Cache")

jest.useFakeTimers()
jest.mock("fs/promises")

describe("Cache", () => {
  const LOGGING_FOLDER = "./foo"
  const LOGGING_PATH = `${LOGGING_FOLDER}/bar`

  let cache
  beforeEach(async () => {
    jest.resetAllMocks()

    readdir.mockResolvedValue([])

    cache = await Cache(LOGGING_PATH)
  })

  it("ensures cache directory exists", () => {
    expect(mkdir).toHaveBeenCalledWith(LOGGING_PATH, { recursive: true })
  })

  it("caches responses", async () => {
    const toCache = {
      url: "/url",
      status: 200,
      body: "foobar",
      headers: { "content-type": "text/xml" },
    }

    await cache.set("https://www.example.com/b-@r", toCache)

    expect(writeFile).toHaveBeenCalledWith(
      `${LOGGING_PATH}/${Date.now()}@https%3A%2F%2Fwww.example.com%2Fb-%40r`,
      JSON.stringify(toCache),
    )
  })

  it("reuses cached responses", async () => {
    const cached = {
      url: "/url",
      status: 200,
      body: "foobar",
      headers: { "content-type": "text/xml" },
    }
    const path = "1700753057613@https%3A%2F%2Fwww.example.com%2Fb-%40r"
    readdir.mockResolvedValue([path])
    readFile.mockResolvedValue(JSON.stringify(cached))

    const result = await cache.get("https://www.example.com/b-@r")

    expect(result).toEqual(cached)
    expect(readFile).toHaveBeenCalledWith(`${LOGGING_PATH}/${path}`, {
      encoding: "utf8",
    })
  })

  it("returns undefined if no cached response", async () => {
    readdir.mockResolvedValue([])

    const result = await cache.get("new/url")

    expect(result).toEqual(undefined)
  })

  it("trims filenames over 150 characters long", async () => {
    const content = {
      url: "/url",
      status: 200,
      body: "foobar",
      headers: { "content-type": "text/xml" },
    }
    const longUrl =
      "https://es.shein.com/A-multi-purpose-large-capacity-clothes-hanger-and-trousers-rack-that-does-not-take-up-space.-One-clothes-hanger-and-trousers-rack-can-hang-4-layers-of-trousers,-6-layers-of-trousers,-and-8-layers-of-trousers.-Super-space-saving-p-26369719-cat-7166.html"
    const trimmedName = `${Date.now()}@https%3A%2F%2Fes.shein.com%2FA-multi-purpose-large-capacity-clothes-hanger-and-trousers-rack-that-does-not-take-up-space.-One-clothes-hanger-and-trous2bac94693b9320267853652cd171d112`
    readdir.mockResolvedValue([trimmedName])
    readFile.mockResolvedValue(JSON.stringify(content))
    const expectedPath = `${LOGGING_PATH}/${Date.now()}@https%3A%2F%2Fes.shein.com%2FA-multi-purpose-large-capacity-clothes-hanger-and-trousers-rack-that-does-not-take-up-space.-One-clothes-hanger-and-trous2bac94693b9320267853652cd171d112`

    await cache.set(longUrl, content)
    const result = await cache.get(longUrl)

    expect(result).toStrictEqual(content)
    expect(writeFile).toHaveBeenCalledWith(
      expectedPath,
      JSON.stringify(content),
    )
    expect(readFile).toHaveBeenCalledWith(expectedPath, expect.anything())
  })

  it("favours latest responses", async () => {
    const olderPath = "1700753057614@https%3A%2F%2Fwww.example.com%2Fb-%40r"
    readdir.mockResolvedValue([
      "1700753057613@https%3A%2F%2Fwww.example.com%2Fb-%40r",
      olderPath,
    ])
    readFile.mockResolvedValue("{}")

    await cache.get("https://www.example.com/b-@r")

    expect(readFile).toHaveBeenCalledWith(
      `${LOGGING_PATH}/1700753057614@https%3A%2F%2Fwww.example.com%2Fb-%40r`,
      expect.anything(),
    )
  })
})
