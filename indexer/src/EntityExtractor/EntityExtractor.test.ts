import { expect, describe, it, beforeEach, vi } from "vitest"
import { MockPython, AUGMENTED_DATA, PAGE } from "#mocks"
import EntityExtractor from "./EntityExtractor.js"

describe("EntityExtractor", () => {
  let python: MockPython
  beforeEach(async () => {
    python = MockPython()
  })

  it("extracts category", async () => {
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
    python.mockImplementation(() => DERIVED_DATA)

    const { category } = await EntityExtractor()(
      { jsonLd: [productTag], opengraph: {}, headings: {} },
      PAGE,
    )

    expect(category).toStrictEqual({
      name: DERIVED_DATA.category,
    })
  })
})
