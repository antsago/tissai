import { describe, it, expect, beforeEach } from "vitest"
import { ATTRIBUTE, CAT_ATTRIBUTE, QUERY } from "mocks"
import parseSearchParams from "./parseSearchParams"

describe("parseSearchParams", () => {
  let params: URLSearchParams
  beforeEach(() => {
    params = new URLSearchParams()
  })

  it("sets defaults values", async () => {
    const result = parseSearchParams(params)

    expect(result).toStrictEqual({
      brand: undefined,
      category: undefined,
      max: undefined,
      min: undefined,
      query: '',
      tags: [],
      attributes: {},
    })
  })

  it("parses filters", async () => {
    const min = 11.1
    const max = 22.2
    const brand = "a brand"
    const category = "the category"
    const tag = "tag"
    params.append("q", QUERY)
    params.append("min", String(min))
    params.append("max", String(max))
    params.append("brand", brand)
    params.append("category", category)
    params.append("inc", tag)
    params.append(ATTRIBUTE.label, ATTRIBUTE.value)

    const result = parseSearchParams(params)

    expect(result).toStrictEqual({
      query: QUERY,
      brand,
      min,
      max,
      category,
      tags: [tag],
      attributes: {
        [ATTRIBUTE.label]: [ATTRIBUTE.value],
      }
    })
  })

  it("supports multiple tag filters", async () => {
    const tag1 = "tag"
    const tag2 = "myTag"
    params.append("inc", tag1)
    params.append("inc", tag2)

    const result = parseSearchParams(params)

    expect(result).toStrictEqual(expect.objectContaining({
      tags: [tag1, tag2],
    }))
  })

  it("supports multiple attributes", async () => {
    params.append(CAT_ATTRIBUTE.label, CAT_ATTRIBUTE.value)
    params.append(ATTRIBUTE.label, ATTRIBUTE.value)

    const result = parseSearchParams(params)

    expect(result).toStrictEqual(expect.objectContaining({
      attributes: {
        [CAT_ATTRIBUTE.label]: [CAT_ATTRIBUTE.value],
        [ATTRIBUTE.label]: [ATTRIBUTE.value],
      }
    }))
  })

  it("supports multiple attribute values", async () => {
    const otherValue = "myTag"
    params.append(ATTRIBUTE.label, ATTRIBUTE.value)
    params.append(ATTRIBUTE.label, otherValue)

    const result = parseSearchParams(params)

    expect(result).toStrictEqual(expect.objectContaining({
      attributes: {
        [ATTRIBUTE.label]: [ATTRIBUTE.value, otherValue],
      }
    }))
  })
})
