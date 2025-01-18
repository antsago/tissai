import { expect, describe, test } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { getAttributes } from "./getAttributes"

const it = test.extend<{ python: mockPythonFixture }>({
  python: [mockPythonFixture],
})

describe("getAttributes", () => {
  it("returns normalized words", { timeout: 60000 }, async () => {
    const title = "adidas Logo Joggers Junior"

    const result = await getAttributes(title)

    expect(result).toStrictEqual([
      "adidas",
      "logo",
      "joggers",
      "junior",
    ])
  })
  
  it("removes meaningless words", { timeout: 60000 }, async () => {
    const title = "air jordan titan pantalon - mujer"

    const result = await getAttributes(title)

    expect(result).toStrictEqual([
      "air",
      "jordan",
      "titan",
      "pantalon",
      "mujer",
    ])
  })
})
