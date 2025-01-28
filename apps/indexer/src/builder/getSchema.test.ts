import { expect, describe, test } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { LLM } from "../trainer/label/LLM"
import { getSchema } from "./getSchema"
import { Tokenizer } from "@tissai/tokenizer"

const it = test.extend<{ python: mockPythonFixture }>({
  python: [mockPythonFixture, { auto: true }],
})

describe("getSchema", () => {
  it("generates schema from title", async ({ python }) => {
    const title = "adidas Logo Joggers Junior"
    let mockLLM = true
    python.mockImplementation(() => {
      if (mockLLM) {
        mockLLM = false
        return ["jogger"]
      }

      return [
        { text: "adidas", isMeaningful: true },
        { text: "logo", isMeaningful: true },
        { text: "joggers", isMeaningful: true },
        { text: "junior", isMeaningful: true },
      ]
    })

    const result = await getSchema(Tokenizer(), LLM())(title)

    expect(result).toStrictEqual({
      category: "jogger",
      categoryWord: "joggers",
      attributes: ["adidas", "logo", "junior"],
    })
  })
})
