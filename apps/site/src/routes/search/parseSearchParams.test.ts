import { describe, it, expect, beforeEach } from "vitest"
import { STRING_ATTRIBUTE, CAT_ATTRIBUTE, QUERY } from "mocks"
import { extractFilters } from "./parseSearchParams"

describe("extractFilters", () => {
  let params: URLSearchParams
  beforeEach(() => {
    params = new URLSearchParams()
  })

  it("sets defaults values", async () => {
    const result = extractFilters(params)

    expect(result).toStrictEqual({
      brand: undefined,
      max: undefined,
      min: undefined,
      query: "",
      attributes: {},
    })
  })

  it("parses filters", async () => {
    const min = 11.1
    const max = 22.2
    const brand = "a brand"
    params.append("q", QUERY)
    params.append("min", String(min))
    params.append("max", String(max))
    params.append("brand", brand)
    params.append(STRING_ATTRIBUTE.label, STRING_ATTRIBUTE.value)

    const result = extractFilters(params)

    expect(result).toStrictEqual({
      query: QUERY,
      brand,
      min,
      max,
      attributes: {
        [STRING_ATTRIBUTE.label]: [STRING_ATTRIBUTE.value],
      },
    })
  })

  it("supports multiple attributes", async () => {
    params.append(CAT_ATTRIBUTE.label, CAT_ATTRIBUTE.value)
    params.append(STRING_ATTRIBUTE.label, STRING_ATTRIBUTE.value)

    const result = extractFilters(params)

    expect(result).toStrictEqual(
      expect.objectContaining({
        attributes: {
          [CAT_ATTRIBUTE.label]: [CAT_ATTRIBUTE.value],
          [STRING_ATTRIBUTE.label]: [STRING_ATTRIBUTE.value],
        },
      }),
    )
  })

  it("supports multiple attribute values", async () => {
    const otherValue = "myValue"
    params.append(STRING_ATTRIBUTE.label, STRING_ATTRIBUTE.value)
    params.append(STRING_ATTRIBUTE.label, otherValue)

    const result = extractFilters(params)

    expect(result).toStrictEqual(
      expect.objectContaining({
        attributes: {
          [STRING_ATTRIBUTE.label]: [STRING_ATTRIBUTE.value, otherValue],
        },
      }),
    )
  })
})
