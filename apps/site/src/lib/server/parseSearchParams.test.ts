import { describe, test, expect, beforeEach } from "vitest"
import {
  CATEGORY_NODE,
  LABEL_NODE,
  mockDbFixture,
  VALUE_NODE,
} from "@tissai/db/mocks"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { Db } from "@tissai/db"
import { Tokenizer } from "@tissai/tokenizer"
import { STRING_ATTRIBUTE } from "mocks"
import { parseSearchParams, labelFilters } from "./parseSearchParams"

const it = test.extend({ db: mockDbFixture, python: mockPythonFixture })

describe("labelFilters", () => {
  it("labels category and attributes", async ({ db }) => {
    const filters = {
      category: CATEGORY_NODE.id,
      attributes: [VALUE_NODE.id],
      brand: "brand",
      max: 10,
      min: 0,
    }
    db.pool.query.mockResolvedValue({
      rows: [
        {
          id: CATEGORY_NODE.id,
          name: CATEGORY_NODE.name,
          attributes: [
            {
              label: LABEL_NODE.name,
              id: VALUE_NODE.id,
              name: VALUE_NODE.name,
            },
          ],
        },
      ],
    })

    const result = await labelFilters(filters, Db())

    expect(result).toEqual({
      category: {
        label: "categoría",
        id: CATEGORY_NODE.id,
        name: CATEGORY_NODE.name,
      },
      attributes: [
        {
          label: LABEL_NODE.name,
          id: VALUE_NODE.id,
          name: VALUE_NODE.name,
        },
      ],
      brand: "brand",
      max: 10,
      min: 0,
    })
  })

  it("handles undefined category", async ({ db }) => {
    const filters = {
      attributes: [VALUE_NODE.id],
    }

    const result = await labelFilters(filters, Db())

    expect(result).toEqual({})
    expect(db.pool.query).not.toHaveBeenCalled()
  })

  it("handles non-recognized category", async ({ db }) => {
    const filters = {
      category: CATEGORY_NODE.id,
      attributes: [VALUE_NODE.id],
    }
    db.pool.query.mockResolvedValue({
      rows: [{ id: null, name: null, attributes: null }],
    })

    const result = await labelFilters(filters, Db())

    expect(result).toEqual({})
  })

  it("handles non-recognized attributes", async ({ db }) => {
    const filters = {
      category: CATEGORY_NODE.id,
      attributes: [VALUE_NODE.id],
    }
    db.pool.query.mockResolvedValue({
      rows: [
        { id: CATEGORY_NODE.id, name: CATEGORY_NODE.name, attributes: null },
      ],
    })

    const result = await labelFilters(filters, Db())

    expect(result).toEqual({
      category: {
        label: "categoría",
        id: CATEGORY_NODE.id,
        name: CATEGORY_NODE.name,
      },
      attributes: undefined,
    })
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
      query: "",
      brand: undefined,
      max: undefined,
      min: undefined,
      category: undefined,
      attributes: [],
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
        attributes: [VALUE.name],
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
        attributes: undefined,
      }),
    )
  })
})
