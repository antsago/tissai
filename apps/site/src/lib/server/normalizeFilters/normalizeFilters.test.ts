import { describe, test, expect } from "vitest"
import {
  CATEGORY_NODE,
  LABEL_NODE,
  mockDbFixture,
  VALUE_NODE,
} from "@tissai/db/mocks"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { Db } from "@tissai/db"
import { Tokenizer } from "@tissai/tokenizer"
import { normalizeFilters } from "./normalizeFilters"

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

  it.for([[""], [undefined]])(
    "does not infer if query is '%s'",
    async ([query], { db }) => {
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
    },
  )
})
