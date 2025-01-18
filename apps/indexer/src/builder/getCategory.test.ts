import { expect, describe, test } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { getCategory } from "./getCategory"

const it = test.extend<{ python: mockPythonFixture }>({
  python: [mockPythonFixture],
})

describe("getCategory", () => {
  it("returns llm-generated category", { timeout: 60000 }, async () => {
    const title = "adidas logo joggers junior"

    const result = await getCategory(title)

    expect(result).toStrictEqual("jogger")
  })
})
