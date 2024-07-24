import { expect, describe, it } from "vitest"
import { PAGE } from "#mocks"
import parsedPage from "./parsedPage.js"
import entries from "./opengraph.js"

const BASE_DATA = {
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
    const page = pageWithOg({
      "og:type": "product",
      ...BASE_DATA,
    })

    const result = entries(parsedPage(page))

    expect(result).toStrictEqual({
      title: BASE_DATA["og:title"],
      description: BASE_DATA["og:description"],
      image: [BASE_DATA["og:image"]],
    })
  })

  it("handles empty pages", () => {
    const page = pageWithOg({})

    const result = entries(parsedPage(page))

    expect(result).toStrictEqual({})
  })

  it("ignores non-product opengraph", async () => {
    const page = pageWithOg({
      "og:type": "foo",
      ...BASE_DATA,
    })

    const result = entries(parsedPage(page))

    expect(result).toStrictEqual({})
  })
})
