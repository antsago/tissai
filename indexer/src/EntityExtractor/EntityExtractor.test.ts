import { expect, describe, it, beforeEach, vi } from "vitest"
import { MockPython, AUGMENTED_DATA, PAGE } from "#mocks"
import EntityExtractor from "./EntityExtractor.js"

const productTag = {
  "@context": ["https://schema.org/"],
  "@type": ["Product"],
  name: ["The name of the product"],
  productID: ["121230"],
  brand: [{
    "@type": ["Brand"],
    name: ["WEDZE"],
    image: ["https://brand.com/image.jpg"],
  }],
  description: ["The description"],
  image: ["https://example.com/image.jpg"],
}
const DERIVED_DATA = {
  ...AUGMENTED_DATA,
  embedding: JSON.parse(AUGMENTED_DATA.embedding),
}

describe("EntityExtractor", () => {
  let extract
  let python: MockPython
  beforeEach(async () => {
    python = MockPython()
    extract = EntityExtractor()
  })

  it("extracts category", async () => {
    python.mockImplementation(() => DERIVED_DATA)

    const { category } = await extract(
      { jsonLd: [productTag], opengraph: {}, headings: {} },
      PAGE,
    )

    expect(category).toStrictEqual({
      name: DERIVED_DATA.category,
    })
  })

  it("extracts tags", async () => {
    python.mockImplementation(() => DERIVED_DATA)

    const { tags } = await extract(
      { jsonLd: [productTag], opengraph: {}, headings: {} },
      PAGE,
    )

    expect(tags).toStrictEqual([{
      name: DERIVED_DATA.tags[0],
    }])
  })

  it("extracts multiple tags", async () => {
    const foundTags = ["two", "tags"]
    python.mockImplementation(() => ({
      ...DERIVED_DATA,
      tags: foundTags,
    }))

    const { tags } = await extract(
      { jsonLd: [productTag], opengraph: {}, headings: {} },
      PAGE,
    )

    expect(tags).toStrictEqual([
      { name: foundTags[0] },
      { name: foundTags[1] },
    ])
  })
})
