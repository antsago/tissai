import { expect, describe, test, beforeEach } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { DERIVED_DATA, PAGE } from "#mocks"
import { EntityExtractor } from "./EntityExtractor.js"

type Fixtures = {
  mockPython: mockPythonFixture
}

const it = test.extend<Fixtures>({
  mockPython: [mockPythonFixture, { auto: true }],
})

const jsonLd = {
  "@context": ["https://schema.org/"],
  "@type": ["Product"],
  name: ["The name of the product"],
  productID: ["121230"],
  brand: [
    {
      "@type": ["Brand"],
      name: ["wedze"],
      image: ["https://brand.com/image.jpg"],
    },
  ],
  description: ["The description"],
  image: ["https://example.com/image.jpg"],
  offers: [
    {
      "@type": ["Offer"],
      url: ["https://example.com/offer"],
      price: [10],
      priceCurrency: ["EUR"],
      seller: [
        {
          "@type": ["Organization"],
          name: ["pertemba"],
        },
      ],
    },
  ],
}
const opengraph = {
  "og:type": "product",
  "og:title": "Friend Smash Coin",
  "og:image": "http://www.friendsmash.com/images/coin_600.png",
  "og:description": "Friend Smash Coins to purchase upgrades and items!",
  "og:url": "http://www.friendsmash.com/og/coins.html",
}
const headings = {
  title: "The page title",
  description: "The description",
  keywords: "Some, keywords",
  author: "The author",
  robots: "index,follow",
  canonical: PAGE.url,
}

describe("EntityExtractor", () => {
  let extractor: EntityExtractor
  beforeEach<Fixtures>(async ({ mockPython }) => {
    extractor = EntityExtractor()
    mockPython.mockReturnValue(DERIVED_DATA)
  })

  it("closes python on close", async ({ mockPython }) => {
    await extractor.close()

    expect(mockPython.worker.end).toHaveBeenCalled()
  })

  it("handles empty pages", async ({ mockPython }) => {
    const act = extractor.extract(
      { jsonLd: [], opengraph: {}, headings: {} },
      PAGE,
    )

    await expect(act).rejects.toThrow("Product without title")
    expect(mockPython.worker.send).not.toHaveBeenCalled()
  })

  it("ignores non-product opengraph", async () => {
    const { product } = await extractor.extract(
      { jsonLd: [], opengraph: { ...opengraph, "og:type": "foo" }, headings },
      PAGE,
    )

    expect(product).toStrictEqual(
      expect.objectContaining({
        title: headings.title,
      }),
    )
  })
})
