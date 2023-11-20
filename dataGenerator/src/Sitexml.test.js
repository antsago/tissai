const Sitexml = require("./Sitexml")

describe("Sitexml", () => {
  const DOMAIN = "example.com"

  it("parses siteindexes", async () => {
    const text = `
      <?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap><loc>https://${DOMAIN}/sitemap1.xml</loc></sitemap>
        <sitemap><loc>https://${DOMAIN}/sitemap2.xml</loc></sitemap>
      </sitemapindex>
    `

    const site = await Sitexml(text)
    
    expect(site.isSiteindex).toBe(true)
    expect(site.isSitemap).toBe(false)
    expect(site.sitemaps).toEqual([`https://${DOMAIN}/sitemap1.xml`, `https://${DOMAIN}/sitemap2.xml`])
  })

  it("parses sitemaps", async () => {
    const text = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>https://${DOMAIN}/url1</loc></url>
        <url><loc>https://${DOMAIN}/url2/</loc></url>
      </urlset>
    `

    const site = await Sitexml(text)
    
    expect(site.isSitemap).toBe(true)
    expect(site.isSiteindex).toBe(false)
    expect(site.urls).toEqual([`https://${DOMAIN}/url1`, `https://${DOMAIN}/url2/`])
  })
})
