import { describe, test, expect } from "vitest"
import {
  CATEGORY_NODE,
  LABEL_NODE,
  mockDbFixture,
  VALUE_NODE,
} from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { labelFilters } from "./labelFilters"

const it = test.extend({ db: mockDbFixture })

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
      rows: [],
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
        id: CATEGORY_NODE.id,
        name: CATEGORY_NODE.name,
      },
      attributes: undefined,
    })
  })
})
