import { describe, it, expect, beforeEach } from "vitest"
import { STRING_ATTRIBUTE, QUERY, BOOL_ATTRIBUTE } from "mocks"
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
    const category = "the category"
    params.append("q", QUERY)
    params.append("min", String(min))
    params.append("max", String(max))
    params.append("brand", brand)
    params.append("cat", category)
    params.append(STRING_ATTRIBUTE.label, STRING_ATTRIBUTE.value)

    const result = extractFilters(params)

    expect(result).toStrictEqual({
      query: QUERY,
      brand,
      min,
      max,
      category,
      attributes: [STRING_ATTRIBUTE.value],
    })
  })

  it("supports multiple attributes", async () => {
    params.append(BOOL_ATTRIBUTE.label, BOOL_ATTRIBUTE.value)
    params.append(STRING_ATTRIBUTE.label, STRING_ATTRIBUTE.value)

    const result = extractFilters(params)

    expect(result).toStrictEqual(
      expect.objectContaining({
        attributes: [BOOL_ATTRIBUTE.value, STRING_ATTRIBUTE.value],
      }),
    )
  })
})
