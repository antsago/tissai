const Fetcher = require("./Fetcher")

jest.useFakeTimers()
jest.mock("fs/promises")

describe("Fetcher", () => {
  const PRODUCT_TOKEN = "FooBar/1.0"
  const CRAWL_DELAY = 100
  const URL = "https://www.example.com/b-@r"

  let get
  let cache
  let response
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

    cache = {
      get: jest.fn(),
      set: jest.fn(),
    }

    get = new Fetcher(PRODUCT_TOKEN, cache, CRAWL_DELAY)
  })

  it("sets user-agent", async () => {
    response.mockResolvedValueOnce("foo")

    await get(URL)

    expect(fetch).toHaveBeenCalledWith(URL, {
      headers: { ["User-Agent"]: PRODUCT_TOKEN },
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

  it("caches responses", async () => {
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

    const result = await get(URL)

    expect(result).toEqual(expected)
    expect(cache.set).toHaveBeenCalledWith(URL, expected)
  })

  it("reuses cached responses", async () => {
    const expected = {
      url: "/redirected",
      status: 200,
      body: "foobar",
      headers: { "content-type": "text/xml" },
    }
    cache.get.mockResolvedValue(expected)

    const result = await get(URL)

    expect(result).toEqual(expected)
    expect(fetch).not.toHaveBeenCalled()
    expect(cache.get).toHaveBeenCalledWith(URL)
  })
})
