const getUrls = require("./getUrls")

describe("getUrls", () => {
  const DOMAIN = "example.com"
  
  let response
  beforeEach(() => {
    response = jest.fn()
    fetch = jest.fn().mockResolvedValue({ text: response })
  })

  it("handles missing robots.txt", async () => {
    response.mockRejectedValue(new Error('Booh!'))

    const result = await getUrls(DOMAIN)

    expect(result).toEqual([])
  })

  it("lists allowed urls", async () => {
    const url1 = `https://${DOMAIN}/url1`
    const url2 = `https://${DOMAIN}/url2/`
    const robots = `Sitemap: https://${DOMAIN}/sitemap.xml`
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url><url><loc>${url2}</loc></url></urlset>`
    response.mockResolvedValueOnce(robots).mockResolvedValueOnce(sitemap)

    const result = await getUrls(DOMAIN)

    expect(result).toEqual([url1, url2])
  })
})
