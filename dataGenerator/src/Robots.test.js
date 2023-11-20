const Robots = require("./Robots")

describe("Robots", () => {
  const DOMAIN = "www.example.com"
  const URL = `https://${DOMAIN}/robots.txt`
  const PRODUCT_TOKEN = "FooBar/1.0"

  it("returns specified sitemaps", async () => {
    const sitemap1 = `https://${DOMAIN}/sitemap.xml`
    const sitemap2 = `https://${DOMAIN}/sitemap2.xml`
    const text = `Sitemap: ${sitemap1}\nSitemap: ${sitemap2}`

    const robots = Robots(URL, text, PRODUCT_TOKEN)

    expect(robots.sitemaps).toEqual([sitemap1, sitemap2])
  })

  it("identifies allowed urls", async () => {
    const text = `User-Agent: ${PRODUCT_TOKEN}\nDisallow: /notallowed`
    
    const robots = Robots(URL, text, PRODUCT_TOKEN)

    expect(robots.isAllowed(`https://${DOMAIN}/allowed`)).toBe(true)
    expect(robots.isAllowed(`https://${DOMAIN}/notallowed`)).toBe(false)
  })
})
