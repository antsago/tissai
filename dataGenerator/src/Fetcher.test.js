const Fetcher = require("./Fetcher")

describe("Fetcher", () => {
  const PRODUCT_TOKEN = "FooBar/1.0"
  const CRAWL_DELAY = 100

  let response
  let get
  beforeEach(() => {
    response = jest.fn()
    fetch = jest.fn((url) => Promise.resolve({ text: response, url }))

    get = new Fetcher(PRODUCT_TOKEN, CRAWL_DELAY)
  })

  it("sets user-agent", async () => {
    response.mockResolvedValueOnce('foo')
    
    await get('foo')
    
    expect(fetch).toHaveBeenCalledWith(
      'foo',
      { headers: { UserAgent: PRODUCT_TOKEN } },
    )
  })

  it("waits delay between calls", async () => {
    jest.useFakeTimers()
    response.mockResolvedValueOnce('foo').mockResolvedValueOnce('bar')
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
})
