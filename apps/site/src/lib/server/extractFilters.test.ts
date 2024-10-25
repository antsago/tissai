import { describe, it, expect, beforeEach } from "vitest"
import { QUERY } from "mocks"
import { extractFilters } from "./extractFilters"

describe("extractFilters", () => {
  let params: URLSearchParams
  beforeEach(() => {
    params = new URLSearchParams()
  })

  it("parses filters", async () => {
    const min = 11.1
    const max = 22.2
    const brand = "a brand"
    const category = "80be7c8e-26dd-47e8-8325-f4bac459dae1"
    const attributes = ["bc82024f-4532-4f98-ba66-6701f83f76ac"]
    params.append("q", QUERY)
    params.append("min", String(min))
    params.append("max", String(max))
    params.append("brand", brand)
    params.append("cat", category)
    params.append("att", attributes[0])

    const result = extractFilters(params)

    expect(result).toStrictEqual({
      query: QUERY,
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

    const result = extractFilters(params)

    expect(result.attributes).toStrictEqual(attributes)
  })

  it("ignores other parameters", async () => {
    params.append("foo", "bar")

    const result = extractFilters(params)

    expect(result).toStrictEqual({})
  })
})
