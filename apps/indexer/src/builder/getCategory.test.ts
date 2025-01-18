import { expect, describe, test } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { LLM } from "../trainer/label/LLM"
import { getCategory } from "./getCategory"

const it = test.extend<{ python: mockPythonFixture }>({
  python: mockPythonFixture,
})

describe("getCategory", () => {
  it("returns llm-generated category", { timeout: 60000 }, async () => {
    const title = "adidas Logo Joggers Junior"

    const result = await getCategory(title, LLM())

    expect(result).toStrictEqual("pantalón")
  })

  it("returns empty string if no category", async ({ python }) => {
    python.mockReturnValue([])
    const title = "adidas Logo Joggers Junior"

    const result = await getCategory(title, LLM())

    expect(result).toStrictEqual("")
  })
})
