import { expect, describe, it, beforeEach, vi } from 'vitest'
import { FakePg, FakeFs } from '#mocks'

const CACHE_FOLDER = "cache/folder"
const SITE = {
  id: 'id',
  name: 'Example',
  domain: "example.com",
  icon: "example.com/icon",
}
const PRODUCT = {
  name: "The name in og",
  description: "The description in og",
  image: `https//image.com/og-image`,
}
const PRODUCT_PAGE = {
  url: `https://${SITE.domain}/product`,
  status: 200,
  body: `<html>
  <script type="application/ld+json">
    ${JSON.stringify({ ...PRODUCT, ["@type"]: "Product" })}
  </script>
</html>`,
  headers: {},
}
const SITEMAP = {
  url: `https://${SITE.domain}/robots.txt`,
  status: 200,
  body: `
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>${PRODUCT_PAGE.url}</loc></url>
  </urlset>
`,
  headers: {},
}
const ROBOTS = {
  url: `https://${SITE.domain}/robots.txt`,
  status: 200,
  body: `Sitemap: ${SITEMAP.url}`,
  headers: {},
}

describe('index', () => {
  let fakePg: FakePg
  let fakeFs: FakeFs
  beforeEach(() => {
    fakePg = FakePg()
    fakeFs = FakeFs()
  })

  it('returns pages of sites', async () => {
    process.argv = ["node", "index.ts", CACHE_FOLDER]
    fakePg.query.mockResolvedValueOnce({ rows: [SITE] })
    fakeFs.readdir.mockResolvedValue([
      encodeURIComponent(ROBOTS.url),
      encodeURIComponent(SITEMAP.url),
      encodeURIComponent(PRODUCT_PAGE.url),
    ] as any[])
    fakeFs.readFile
      .mockResolvedValueOnce(JSON.stringify(ROBOTS))
      .mockResolvedValueOnce(JSON.stringify(SITEMAP))
      .mockResolvedValueOnce(JSON.stringify(PRODUCT_PAGE))

    await import('./index.js')

    expect(fakeFs.readdir).toHaveBeenCalledWith(CACHE_FOLDER)
    expect(fakePg.query).toHaveBeenLastCalledWith(expect.stringContaining(`INSERT INTO products`))
  })
})
