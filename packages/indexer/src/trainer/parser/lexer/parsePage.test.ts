import { expect, describe, it } from "vitest"
import { PAGE } from "#mocks"
import { parsePage } from "./parsePage.js"

const OG_DATA = {
  "og:type": "product",
  "og:title": "Friend Smash Coin",
  "og:image": "http://www.friendsmash.com/images/coin_600.png",
  "og:description": "Friend Smash Coins to purchase upgrades and items!",
  "og:url": "http://www.friendsmash.com/og/coins.html",
}
const pageWithOg = (ogData: object) => ({
  ...PAGE,
  body: `
    <html>
      <head>
        ${Object.entries(ogData).map(([property, content]) => `<meta property="${property}" content="${content}" />`)}
      </head>
    </html>
  `,
})

describe("opengraph", () => {
  it("extracts opengraph information", () => {
    const page = pageWithOg(OG_DATA)

    const result = parsePage(page.body)

    expect(result).toStrictEqual(
      expect.arrayContaining([
        "og:title",
        OG_DATA["og:title"],
        "og:description",
        OG_DATA["og:description"],
        "og:image",
        OG_DATA["og:image"],
      ]),
    )
  })

  it("extracts heading information", () => {
    const headers = {
      title: "The page title",
      description: "The description",
      keywords: "Some, keywords",
      author: "The author",
      robots: "index,follow",
      canonical: PAGE.url,
    }
    const page = `
        <html>
          <head>
            <title>${headers.title}</title>
            <meta name="viewport" content="something else">
            <meta name="description" content="${headers.description}">
            <meta name="keywords" content="${headers.keywords}">
            <meta name="author" content="${headers.author}">
            <meta name="robots" content="${headers.robots}">
            <link rel="canonical" href="${headers.canonical}" />
          </head>
        </html>
      `

    const result = parsePage(page)

    expect(result).toStrictEqual(
      expect.arrayContaining(Object.entries(headers).flat()),
    )
  })
})
