import { expect, describe, test } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { LLM } from "./LlmLabeler/index.js"
import { getProperties } from "./getProperties.js"

const it = test.extend<{ python: mockPythonFixture }>({
  python: [mockPythonFixture, { auto: true }]
})

describe("getProperties", () => {
  it("gives each word several labels", async ({ python }) => {
    const words = ["product", "title"]
    const outputs = [["a", "b", "c"], ["d", "e", "f"]];
    let i = -1
    python.mockImplementation(() => {
      i+= 1
      return outputs[i]
    })
    

    const result = await getProperties(LLM(), "the product title", words)

    expect(result).toStrictEqual([
      {
        labels: outputs[0],
        value: "product",
      },
      {
        labels: outputs[1],
        value: "title",
      },
    ])
  })
})
