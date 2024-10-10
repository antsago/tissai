import { expect, describe, test } from "vitest"
import { mockDbFixture, queries } from "@tissai/db/mocks"
import { Db } from "@tissai/db"
import { interpret } from "./interpret.js"

const it = test.extend({
  db: mockDbFixture,
})

describe("interpret", () => {
  const WORDS = ["category", "value"]
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

    const result = await interpret(WORDS, Db())

    expect(db).toHaveExecuted(queries.nodes.match(WORDS))
    expect(result).toStrictEqual({
      category: CATEGORY.name,
      properties: [
        {
          label: LABEL.name,
          value: VALUE.name,
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

    const result = await interpret(WORDS, Db())

    expect(result).toStrictEqual({
      category: CATEGORY.name,
      properties: [
        {
          label: LABEL.name,
          value: VALUE.name,
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

    const result = await interpret(WORDS, Db())

    expect(result).toStrictEqual({
      category: CATEGORY.name,
      properties: [],
    })
  })
})
