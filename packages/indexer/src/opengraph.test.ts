import { expect, describe, it } from "vitest"
import { PAGE } from "#mocks"
import parsedPage from "./parsedPage"
import opengraph from "./opengraph"

describe("opengraph", () => {
  it("extracts opengraph information", () => {
    const opengraphData = {
      "og:type": "product",
      "og:title": "Friend Smash Coin",
      "og:image": "http://www.friendsmash.com/images/coin_600.png",
      "og:description": "Friend Smash Coins to purchase upgrades and items!",
      "og:url": "http://www.friendsmash.com/og/coins.html",
    }
    const page = {
      ...PAGE,
      body: `
        <html>
          <head>
            ${Object.entries(opengraphData).map(([property, content]) => `<meta property="${property}" content="${content}" />`)}
          </head>
        </html>
      `,
    }

    const result = opengraph(parsedPage(page))

    expect(result).toStrictEqual(opengraphData)
  })

  it("handles empty pages", () => {
    const page = {
      ...PAGE,
      body: `
        <html>
          <head>
          </head>
        </html>
      `,
    }

    const result = opengraph(parsedPage(page))

    expect(result).toStrictEqual({})
  })
})
