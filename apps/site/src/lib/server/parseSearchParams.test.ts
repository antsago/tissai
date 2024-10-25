import { describe, test, expect, beforeEach } from "vitest"
import {
  CATEGORY_NODE,
  LABEL_NODE,
  mockDbFixture,
  queries,
  VALUE_NODE,
} from "@tissai/db/mocks"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { Db } from "@tissai/db"
import { Tokenizer } from "@tissai/tokenizer"
import { STRING_ATTRIBUTE } from "mocks"
import {
  parseSearchParams,
  labelFilters,
  inferFilters,
} from "./parseSearchParams"

const it = test.extend({ db: mockDbFixture, python: mockPythonFixture })

describe("labelFilters", () => {
  it("labels category and attributes", async ({ db }) => {
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

    const result = await labelFilters(CATEGORY_NODE.id, [VALUE_NODE.id], Db())

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
    })
  })

  it("handles non-recognized category", async ({ db }) => {
    db.pool.query.mockResolvedValue({
      rows: [{ id: null, name: null, attributes: null }],
    })

    const result = await labelFilters(CATEGORY_NODE.id, [VALUE_NODE.id], Db())

    expect(result).toEqual({})
  })

  it("handles undefined attributes", async ({ db }) => {
    db.pool.query.mockResolvedValue({
      rows: [
        { id: CATEGORY_NODE.id, name: CATEGORY_NODE.name, attributes: null },
      ],
    })

    const result = await labelFilters(CATEGORY_NODE.id, undefined, Db())

    expect(result).toEqual({
      category: {
        label: "categoría",
        id: CATEGORY_NODE.id,
        name: CATEGORY_NODE.name,
      },
      attributes: undefined,
    })
  })

  it("handles non-recognized attributes", async ({ db }) => {
    db.pool.query.mockResolvedValue({
      rows: [
        { id: CATEGORY_NODE.id, name: CATEGORY_NODE.name, attributes: null },
      ],
    })

    const result = await labelFilters(CATEGORY_NODE.id, [VALUE_NODE.id], Db())

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

describe("inferFilters", () => {
  it("infers filters from query", async ({ db, python }) => {
    const query = `${CATEGORY_NODE.name} ${VALUE_NODE.name}`
    const WORDS = [
      {
        isMeaningful: true,
        trailing: " ",
        text: CATEGORY_NODE.name,
        originalText: CATEGORY_NODE.name,
      },
      {
        isMeaningful: true,
        trailing: "",
        text: VALUE_NODE.name,
        originalText: VALUE_NODE.name,
      },
    ]
    python.mockReturnValue(WORDS)
    db.pool.query.mockReturnValueOnce({
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

    const result = await inferFilters(query, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual({
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
    })
    expect(python.worker.send).toHaveBeenCalledWith(query)
    expect(db).toHaveExecuted(
      queries.nodes.match([CATEGORY_NODE.name, VALUE_NODE.name]),
    )
  })

  it("handles no infered category", async ({ db, python }) => {
    const query = "foo bar"
    const WORDS = [
      {
        isMeaningful: true,
        trailing: " ",
        text: "foo",
        originalText: "foo",
      },
      {
        isMeaningful: true,
        trailing: "",
        text: "bar",
        originalText: "bar",
      },
    ]
    python.mockReturnValue(WORDS)
    db.pool.query.mockReturnValueOnce({
      rows: [],
    })

    const result = await inferFilters(query, {
      db: Db(),
      tokenizer: Tokenizer(),
    })

    expect(result).toStrictEqual({})
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
