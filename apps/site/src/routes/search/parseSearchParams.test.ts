import { describe, test, expect, beforeEach } from "vitest"
import { mockDbFixture } from "@tissai/db/mocks"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { Db } from "@tissai/db"
import { Tokenizer } from "@tissai/tokenizer"
import { STRING_ATTRIBUTE, QUERY, BOOL_ATTRIBUTE } from "mocks"
import {
  extractFilters,
  parseSearchParams,
} from "../../lib/server/parseSearchParams"

const it = test.extend({ db: mockDbFixture, python: mockPythonFixture })

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
      attributes: {
        [STRING_ATTRIBUTE.label]: [STRING_ATTRIBUTE.value],
      },
    })
  })

  it("supports multiple attributes", async () => {
    params.append(BOOL_ATTRIBUTE.label, BOOL_ATTRIBUTE.value)
    params.append(STRING_ATTRIBUTE.label, STRING_ATTRIBUTE.value)

    const result = extractFilters(params)

    expect(result).toStrictEqual(
      expect.objectContaining({
        attributes: {
          [BOOL_ATTRIBUTE.label]: [BOOL_ATTRIBUTE.value],
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

describe("parseSearchParams", () => {
  let params: URLSearchParams
  beforeEach(() => {
    params = new URLSearchParams()
  })

  it("handles empty search", async ({ db, python }) => {
    db.pool.query.mockResolvedValue({ rows: [] })
    python.mockReturnValue([])

    const result = await parseSearchParams(params, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual({
      brand: undefined,
      max: undefined,
      min: undefined,
      category: undefined,
      query: "",
      attributes: {},
    })
  })

  it("infers from query if no explicit category filter", async ({
    db,
    python,
  }) => {
    const WORDS = [
      {
        isMeaningful: true,
        trailing: " ",
        text: "category",
        originalText: "category",
      },
      {
        isMeaningful: true,
        trailing: "",
        text: "value",
        originalText: "value",
      },
    ]
    const CATEGORY = {
      name: "category",
      tally: 3,
    }
    const LABEL = {
      name: "label",
      tally: 2,
    }
    const VALUE = {
      name: "value",
      tally: 2,
    }
    const query = "category value"
    const root = {
      ...CATEGORY,
      children: [
        {
          ...LABEL,
          children: [VALUE],
        },
      ],
    }
    db.pool.query.mockReturnValueOnce({
      rows: [root],
    })
    python.mockReturnValue(WORDS)
    params.append("q", query)
    params.append(STRING_ATTRIBUTE.label, STRING_ATTRIBUTE.value)

    const result = await parseSearchParams(params, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual(
      expect.objectContaining({
        category: CATEGORY.name,
        attributes: {
          [LABEL.name]: [VALUE.name],
        },
      }),
    )
  })

  it("does not infer if explicit category filter", async () => {
    const category = "the category"
    params.append("cat", category)

    const result = await parseSearchParams(params, {} as any)

    expect(result).toStrictEqual(
      expect.objectContaining({
        category,
        attributes: {},
      }),
    )
  })
})
