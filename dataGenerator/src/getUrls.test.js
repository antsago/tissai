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

  it("filters disallowed urls", async () => {
    const url1 = `https://${DOMAIN}/url1`
    const url2 = `https://${DOMAIN}/url2/`
    const robots = `Sitemap: https://${DOMAIN}/sitemap.xml\nUser-Agent: *\nDisallow: /url2`
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url><url><loc>${url2}</loc></url></urlset>`
    response.mockResolvedValueOnce(robots).mockResolvedValueOnce(sitemap)

    const result = await getUrls(DOMAIN)

    expect(result).toEqual([url1])
  })

  it("supports siteindexes", async () => {
    const url1 = `https://${DOMAIN}/url1`
    const url2 = `https://${DOMAIN}/url2/`
    const robots = `Sitemap: https://${DOMAIN}/siteindex.xml\nUser-Agent: *\nDisallow:`
    const siteindex = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap><loc>https://${DOMAIN}/sitemap1.xml</loc></sitemap>
      <sitemap><loc>https://${DOMAIN}/sitemap2.xml</loc></sitemap>
    </sitemapindex>`
    const sitemap1 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url></urlset>`
    const sitemap2 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url2}</loc></url></urlset>`
    response.mockResolvedValueOnce(robots).mockResolvedValueOnce(siteindex).mockResolvedValueOnce(sitemap1).mockResolvedValueOnce(sitemap2)

    const result = await getUrls(DOMAIN)

    expect(result).toEqual([url1, url2])
  })

  it("ignores disallowed sitemaps", async () => {
    const url1 = `https://${DOMAIN}/url1`
    const url2 = `https://${DOMAIN}/url2/`
    const robots = `Sitemap: https://${DOMAIN}/sitemap.xml\nSitemap: https://${DOMAIN}/sitemap2.xml\nUser-Agent: *\nDisallow:/sitemap2`
    const sitemap1 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url></urlset>`
    const sitemap2 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url2}</loc></url></urlset>`
    response.mockResolvedValueOnce(robots).mockResolvedValueOnce(sitemap1).mockResolvedValueOnce(sitemap2)

    const result = await getUrls(DOMAIN)

    expect(result).toEqual([url1])
  })

  it("ignores disallowed siteindex", async () => {
    const url1 = `https://${DOMAIN}/url1`
    const url2 = `https://${DOMAIN}/url2/`
    const robots = `Sitemap: https://${DOMAIN}/sitemap.xml\nSitemap: https://${DOMAIN}/siteindex.xml\nUser-Agent: *\nDisallow:/siteindex`
    const siteindex = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap><loc>https://${DOMAIN}/sitemap2.xml</loc></sitemap>
    </sitemapindex>`
    const sitemap1 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url></urlset>`
    const sitemap2 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url2}</loc></url></urlset>`
    response.mockResolvedValueOnce(robots).mockResolvedValueOnce(sitemap1).mockResolvedValueOnce(siteindex).mockResolvedValueOnce(sitemap2)

    const result = await getUrls(DOMAIN)

    expect(result).toEqual([url1])
  })

  it("ignores sitemaps and siteindex with retrieval errors", async () => {
    const url1 = `https://${DOMAIN}/url1`
    const robots = `Sitemap: https://${DOMAIN}/sitemap.xml\nSitemap: https://${DOMAIN}/sitemap2.xml\nSitemap: https://${DOMAIN}/siteindex.xml`
    const sitemap2 = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url1}</loc></url></urlset>`
    response.mockResolvedValueOnce(robots).mockRejectedValueOnce(new Error('Booh!')).mockResolvedValueOnce(sitemap2).mockRejectedValueOnce(new Error('Booh!'))

    const result = await getUrls(DOMAIN)

    expect(result).toEqual([url1])
  })

  it("sets user-agent", async () => {
    const userAgentHeaders = { headers: { UserAgent: 'Wibnix/1.0' }}
    const sitemapUrl = `https://${DOMAIN}/sitemap1.xml`
    const siteindexUrl = `https://${DOMAIN}/siteindex.xml`
    const robots = `Sitemap: ${siteindexUrl}`
    const siteindex = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${sitemapUrl}</loc></sitemap></sitemapindex>`
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${DOMAIN}/url1</loc></url></urlset>`
    response.mockResolvedValueOnce(robots).mockResolvedValueOnce(siteindex).mockResolvedValueOnce(sitemap)

    await getUrls(DOMAIN)

    expect(fetch).toHaveBeenNthCalledWith(1, `https://${DOMAIN}/robots.txt`, userAgentHeaders)
    expect(fetch).toHaveBeenNthCalledWith(2, siteindexUrl, userAgentHeaders)
    expect(fetch).toHaveBeenNthCalledWith(3, sitemapUrl, userAgentHeaders)
  })
})
