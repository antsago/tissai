import { expect, describe, it } from "vitest"
import { interpret } from "./interpret.js"

describe("interpret", () => {
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

  it("returns interpretation that matches most words", async () => {
    const root = {
      ...CATEGORY,
      children: [
        {
          ...LABEL,
          children: [VALUE],
        },
      ],
    }

    const result = await interpret([root])

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

  it("uses probability to break ties", async () => {
    const nodes = [
      { name: `${CATEGORY.name}-2`, tally: CATEGORY.tally-1, children: null},
      {...CATEGORY, children: null},
    ]

    const result = await interpret(nodes)

    expect(result).toStrictEqual({
      category: CATEGORY.name,
      properties: [],
    })
  })
})
