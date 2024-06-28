import { expect, describe, test, beforeEach } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { DERIVED_DATA, PAGE } from "#mocks"
import { PythonPool } from "@tissai/python-pool"
import tags from "./tags.js"

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

describe("tags", () => {
  const TITLE = "Product title"
  let pool: PythonPool<any, any>
  beforeEach<Fixtures>(async () => {
    pool = PythonPool("script", { log: () => {} })
  })

  it("extracts tag", async ({ mockPython }) => {
    const foundTags = ["myTag"]
    mockPython.mockReturnValue({ tags: foundTags })

    const result = await tags(TITLE, pool)

    expect(result).toStrictEqual([
      {
        name: foundTags[0],
      },
    ])
    expect(mockPython.worker.send).toHaveBeenCalledWith({
      method: "tags",
      input: TITLE,
    })
  })

  it("extracts multiple tags", async ({ mockPython }) => {
    const foundTags = ["two", "tags"]
    mockPython.mockReturnValue({ tags: foundTags })

    const result = await tags(TITLE, pool)

    expect(result).toStrictEqual([
      { name: foundTags[0] },
      { name: foundTags[1] },
    ])
  })
})
