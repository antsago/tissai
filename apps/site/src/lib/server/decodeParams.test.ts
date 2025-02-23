import { describe, it, expect, beforeEach } from "vitest"
import { PRODUCT } from "@tissai/db/mocks"
import { decodeParams } from "./decodeParams"

describe("decodeParams", () => {
  let params: URLSearchParams
  beforeEach(() => {
    params = new URLSearchParams()
  })

  it("parses parameters", async () => {
    const min = 11.1
    const max = 22.2
    const brand = "a brand"
    const category = "80be7c8e-26dd-47e8-8325-f4bac459dae1"
    const attributes = ["bc82024f-4532-4f98-ba66-6701f83f76ac"]
    params.append("q", PRODUCT.title)
    params.append("min", String(min))
    params.append("max", String(max))
    params.append("brand", brand)
    params.append("cat", category)
    params.append("att", attributes[0])

    const result = decodeParams(params)

    expect(result).toStrictEqual({
      query: PRODUCT.title,
      brand,
      min,
      max,
      category,
      attributes,
    })
  })

  it("supports multiple attributes", async () => {
    const attributes = [
      "bc82024f-4532-4f98-ba66-6701f83f76ac",
      "b24cfb54-c160-4190-9715-deeb0c7798ac",
    ]
    params.append("att", attributes[0])
    params.append("att", attributes[1])

    const result = decodeParams(params)

    expect(result.attributes).toStrictEqual(attributes)
  })

  it("ignores other parameters", async () => {
    params.append("q", PRODUCT.title)
    params.append("foo", "bar")

    const result = decodeParams(params)

    expect(result).toStrictEqual({ query: PRODUCT.title })
  })

  it("handles empty search", async () => {
    const result = decodeParams(params)

    expect(result).toStrictEqual({ query: "" })
  })
})
