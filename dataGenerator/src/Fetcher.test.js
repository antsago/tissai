const Fetcher = require("./Fetcher")
const { writeFile } = require("fs/promises")

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
    fetch = jest.fn((url) => Promise.resolve({ text: response, url, status: 200, headers: new Headers() }))

    get = new Fetcher(PRODUCT_TOKEN, LOGGING_PATH, CRAWL_DELAY)
  })

  it("sets user-agent", async () => {
    response.mockResolvedValueOnce("foo")

    await get("foo")

    expect(fetch).toHaveBeenCalledWith("foo", {
      headers: { UserAgent: PRODUCT_TOKEN },
    })
  })

  it("waits delay between calls", async () => {
    jest.useFakeTimers()
    response.mockResolvedValueOnce("foo").mockResolvedValueOnce("bar")
    const call1 = get("/foo")
    const call2 = get("/bar")

    await jest.advanceTimersByTimeAsync(CRAWL_DELAY - 1)
    await call1
    expect(fetch).toHaveBeenCalledTimes(1)

    await jest.advanceTimersByTimeAsync(1)

    await call2
    expect(fetch).toHaveBeenCalledTimes(2)

    jest.useRealTimers()
  })

  it("logs responses", async () => {
    jest.useFakeTimers()
    const expected = {
      url: "/redirected",
      status: 200,
      body: "foobar",
      headers: { "content-type": "text/xml" }
    }
    fetch.mockResolvedValueOnce({
      text: jest.fn().mockResolvedValue(expected.body),
      status: expected.status,
      url: expected.url,
      headers: new Headers(expected.headers)
    })

    const result = await get("https://www.example.com/b-@r")

    expect(result).toEqual(expected)
    expect(writeFile).toHaveBeenCalledWith(`${LOGGING_PATH}/${Date.now()}@https%3A%2F%2Fwww.example.com%2Fb-%40r`, JSON.stringify(expected))

    jest.useRealTimers()
  })
})
