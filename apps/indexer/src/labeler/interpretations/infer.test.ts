import { expect, describe, test } from "vitest"
import {
  CATEGORY_NODE,
  LABEL_NODE,
  mockDbFixture,
  queries,
  VALUE_NODE,
} from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { infer } from "./infer.js"

const it = test.extend({
  db: mockDbFixture,
})

describe("infer", () => {
  const WORDS = ["category", "value"]
  const CATEGORY = {
    id: CATEGORY_NODE.id,
    name: "category",
    tally: 3,
  }
  const LABEL = {
    id: LABEL_NODE.id,
    name: "label",
    tally: 2,
  }
  const VALUE = {
    id: VALUE_NODE.id,
    name: "value",
    tally: 2,
  }

  it("interprets given words", async ({ db }) => {
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

    const result = await infer(WORDS, Db())

    expect(db).toHaveExecuted(queries.nodes.match(WORDS))
    expect(result).toStrictEqual({
      category: CATEGORY,
      attributes: [
        {
          label: LABEL,
          value: VALUE,
        },
      ],
    })
  })

  it("returns interpretation that matches most words", async ({ db }) => {
    const root = {
      ...CATEGORY,
      children: [
        {
          ...LABEL,
          name: `${LABEL.name}-2`,
          children: null,
        },
        {
          ...LABEL,
          children: [VALUE],
        },
      ],
    }
    db.pool.query.mockReturnValueOnce({
      rows: [root],
    })

    const result = await infer(WORDS, Db())

    expect(result).toStrictEqual({
      category: CATEGORY,
      attributes: [
        {
          label: LABEL,
          value: VALUE,
        },
      ],
    })
  })

  it("uses probability to break ties", async ({ db }) => {
    const nodes = [
      { name: `${CATEGORY.name}-2`, tally: CATEGORY.tally - 1, children: null },
      { ...CATEGORY, children: null },
    ]
    db.pool.query.mockReturnValueOnce({
      rows: nodes,
    })

    const result = await infer(WORDS, Db())

    expect(result).toStrictEqual({
      category: CATEGORY,
      attributes: [],
    })
  })

  it("handles empty queries", async ({ db }) => {
    db.pool.query.mockReturnValueOnce({
      rows: [],
    })

    const result = await infer([], Db())

    expect(result).toStrictEqual({
      category: undefined,
      attributes: [],
    })
  })
})
