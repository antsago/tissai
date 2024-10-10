import { expect, describe, it } from "vitest"
import { interpret } from "./interpret.js"

describe("interpret", () => {
  it("returns interpretations", async () => {
    const nodeTree = {
      name: "category-name",
      tally: 3,
      children: [
        {
          name: "label-name",
          tally: 2,
          children: [
            {
              name: "value-name",
              tally: 2,
            },
          ],
        },
      ],
    }

    const result = await interpret([nodeTree])

    expect(result).toStrictEqual([
      {
        category: nodeTree.name,
        attributes: [],
        score: 1,
        probability: 1,
      },
      {
        category: nodeTree.name,
        attributes: [nodeTree.children[0].children[0].name],
        score: 2,
        probability: 2,
      },
    ])
  })
})
