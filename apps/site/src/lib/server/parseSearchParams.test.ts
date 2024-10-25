import { describe, test, expect, beforeEach } from "vitest"
import { CATEGORY_NODE, LABEL_NODE, mockDbFixture, VALUE_NODE } from "@tissai/db/mocks"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { Db } from "@tissai/db"
import { Tokenizer } from "@tissai/tokenizer"
import { STRING_ATTRIBUTE } from "mocks"
import { normalizeFilters, parseSearchParams } from "./parseSearchParams"

const it = test.extend({ db: mockDbFixture, python: mockPythonFixture })

describe("normalizeFilters", () => {
  it("labels if category is given", async ({ db }) => {
    const filters = {
      brand: "Eg",
      max: 10,
      min: 5,
      category: CATEGORY_NODE.id,
      attributes: [VALUE_NODE.id],
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

    const result = await normalizeFilters("the query", filters, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual({
      ...filters,
      category: {
        label: "categoría",
        id: CATEGORY_NODE.id,
        name: CATEGORY_NODE.name,
      },
      attributes: [{
        label: LABEL_NODE.name,
        id: VALUE_NODE.id,
        name: VALUE_NODE.name,
      }]
    })
  })

  it("infers if no category is given", async ({ db, python }) => {
    const filters = {
      brand: "Eg",
      max: 10,
      min: 5,
    }
    python.mockReturnValue([])
    db.pool.query.mockResolvedValue({
      rows: [
        {
          name: CATEGORY_NODE.name,
          id: CATEGORY_NODE.id,
          tally: CATEGORY_NODE.tally,
          children: [
            {
              name: LABEL_NODE.name,
              id: LABEL_NODE.id,
              tally: LABEL_NODE.tally,
              children: [
                {
                  name: VALUE_NODE.name,
                  id: VALUE_NODE.id,
                  tally: VALUE_NODE.tally,
                },
              ],
            },
          ],
        },
      ],
    })

    const result = await normalizeFilters("the query", filters, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual({
      ...filters,
      category: {
        label: "categoría",
        id: CATEGORY_NODE.id,
        name: CATEGORY_NODE.name,
      },
      attributes: [{
        label: LABEL_NODE.name,
        id: VALUE_NODE.id,
        name: VALUE_NODE.name,
      }]
    })
  })

  it("infers if category is not recognized", async ({ db, python }) => {
    const filters = {
      brand: "Eg",
      max: 10,
      min: 5,
      category: "foobar",
    }
    python.mockReturnValue([])
    db.pool.query.mockResolvedValueOnce({ rows: [] })
    db.pool.query.mockResolvedValue({
      rows: [
        {
          name: CATEGORY_NODE.name,
          id: CATEGORY_NODE.id,
          tally: CATEGORY_NODE.tally,
          children: [
            {
              name: LABEL_NODE.name,
              id: LABEL_NODE.id,
              tally: LABEL_NODE.tally,
              children: [
                {
                  name: VALUE_NODE.name,
                  id: VALUE_NODE.id,
                  tally: VALUE_NODE.tally,
                },
              ],
            },
          ],
        },
      ],
    })

    const result = await normalizeFilters("the query", filters, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual({
      ...filters,
      category: {
        label: "categoría",
        id: CATEGORY_NODE.id,
        name: CATEGORY_NODE.name,
      },
      attributes: [{
        label: LABEL_NODE.name,
        id: VALUE_NODE.id,
        name: VALUE_NODE.name,
      }]
    })
  })

  it("handles uninfered category", async ({ db, python }) => {
    const filters = {
      brand: "Eg",
      max: 10,
      min: 5,
    }
    python.mockReturnValue([])
    db.pool.query.mockResolvedValue({
      rows: [],
    })

    const result = await normalizeFilters("the query", filters, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual(filters)
  })

  it.for([[""], [undefined]])("does not infer if query is '%s'", async ([query], { db, python }) => {
    const filters = {
      brand: "Eg",
      max: 10,
      min: 5,
    }

    const result = await normalizeFilters(query, filters, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual(filters)
    expect(db.pool.query).not.toHaveBeenCalled()
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

  it("labels filters", async ({ db, python }) => {
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
