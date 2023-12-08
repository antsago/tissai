const Fetcher = require("./Fetcher")
const { writeFile, appendFile, readdir, readFile } = require("fs/promises")

jest.useFakeTimers()
jest.mock("fs/promises")

describe("Fetcher", () => {
  const PRODUCT_TOKEN = "FooBar/1.0"
  const CRAWL_DELAY = 100
  const LOGGING_PATH = "./foo"

  let response
  let get
  beforeEach(() => {
    jest.resetAllMocks()

    response = jest.fn()
    fetch = jest.fn((url) =>
      Promise.resolve({
        text: response,
        url,
        status: 200,
        headers: new Headers(),
      }),
    )
    readdir.mockResolvedValue([])

    get = new Fetcher(PRODUCT_TOKEN, LOGGING_PATH, CRAWL_DELAY)
  })

  it.skip("sets user-agent", async () => {
    response.mockResolvedValueOnce("foo")

    await get("foo")

    expect(fetch).toHaveBeenCalledWith("foo", {
      headers: { UserAgent: expect.stringContaining(PRODUCT_TOKEN) },
    })
  })

  it("waits when calls are done in parallel", async () => {
    response
      .mockResolvedValueOnce("foo")
      .mockResolvedValueOnce("bar")
      .mockResolvedValueOnce("fii")
    const call1 = get("/foo")
    const call2 = get("/bar")
    const call3 = get("/fii")

    await jest.advanceTimersByTimeAsync(CRAWL_DELAY - 1)
    await call1
    expect(fetch).toHaveBeenCalledTimes(1)
    await jest.advanceTimersByTimeAsync(CRAWL_DELAY)
    await call2
    expect(fetch).toHaveBeenCalledTimes(2)
    await jest.advanceTimersByTimeAsync(1)
    await call3
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it("waits when calls are done sequentially", async () => {
    response.mockResolvedValueOnce("foo").mockResolvedValueOnce("bar")
    call1 = await get("/foo")
    await jest.advanceTimersByTimeAsync(CRAWL_DELAY - 1)

    const call2 = get("/bar")

    expect(fetch).toHaveBeenCalledTimes(1)
    await jest.advanceTimersByTimeAsync(1)
    await call2
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("logs responses", async () => {
    const expected = {
      url: "/redirected",
      status: 200,
      body: "foobar",
      headers: { "content-type": "text/xml" },
    }
    fetch.mockResolvedValueOnce({
      text: jest.fn().mockResolvedValue(expected.body),
      status: expected.status,
      url: expected.url,
      headers: new Headers(expected.headers),
    })

    const result = await get("https://www.example.com/b-@r")

    expect(result).toEqual(expected)
    expect(writeFile).toHaveBeenCalledWith(
      `${LOGGING_PATH}/${Date.now()}@https%3A%2F%2Fwww.example.com%2Fb-%40r`,
      JSON.stringify(expected),
    )
  })

  it("trims filenames over 150 characters long", async () => {
    const longUrl =
      "https://es.shein.com/A-multi-purpose-large-capacity-clothes-hanger-and-trousers-rack-that-does-not-take-up-space.-One-clothes-hanger-and-trousers-rack-can-hang-4-layers-of-trousers,-6-layers-of-trousers,-and-8-layers-of-trousers.-Super-space-saving-p-26369719-cat-7166.html"
    response.mockResolvedValueOnce("foo")

    await get(longUrl)

    expect(writeFile).toHaveBeenCalledWith(
      `${LOGGING_PATH}/${Date.now()}@https%3A%2F%2Fes.shein.com%2FA-multi-purpose-large-capacity-clothes-hanger-and-trousers-rack-that-does-not-take-up-space.-One-clothes-hanger-and-trous2bac94693b9320267853652cd171d112`,
      expect.any(String),
    )
  })

  it("reuses logged responses", async () => {
    const expected = {
      url: "/redirected",
      status: 200,
      body: "foobar",
      headers: { "content-type": "text/xml" },
    }
    const path = "1700753057613@https%3A%2F%2Fwww.example.com%2Fb-%40r"
    readdir.mockResolvedValue([path])
    readFile.mockResolvedValue(JSON.stringify(expected))

    const result = await get("https://www.example.com/b-@r")

    expect(result).toEqual(expected)
    expect(fetch).not.toHaveBeenCalled()
    expect(readFile).toHaveBeenCalledWith(`${LOGGING_PATH}/${path}`, {
      encoding: "utf8",
    })
  })

  it("favours latest responses", async () => {
    const expected = {
      url: "/redirected",
      status: 200,
      body: "foobar",
      headers: { "content-type": "text/xml" },
    }
    readdir.mockResolvedValue([
      "1700753057613@https%3A%2F%2Fwww.example.com%2Fb-%40r",
      "1700753057614@https%3A%2F%2Fwww.example.com%2Fb-%40r",
    ])
    readFile.mockResolvedValue(JSON.stringify(expected))

    await get("https://www.example.com/b-@r")

    expect(readFile).toHaveBeenCalledWith(
      `${LOGGING_PATH}/1700753057614@https%3A%2F%2Fwww.example.com%2Fb-%40r`,
      expect.anything(),
    )
  })

  it("logs errors", async () => {
    const error = new Error("Booh!")
    fetch.mockRejectedValueOnce(error)
    const url = "https://www.example.com/b-@r"

    const act = get(url)

    await expect(act).rejects.toThrow(error)
    expect(appendFile).toHaveBeenCalledWith(
      `${LOGGING_PATH}/errors.log`,
      `${JSON.stringify({
        timestamp: Date.now(),
        url,
        message: error.message,
      })}\n`,
    )
  })
})
