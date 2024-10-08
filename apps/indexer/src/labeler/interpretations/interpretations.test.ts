import { expect, describe, it } from "vitest"
import { createInterpretations } from "./interpretations.js"

describe("createInterpretations", () => {
  it("returns interpretations", async () => {
    const nodeTree = {
      id: "category-id",
      tally: 3,
      children: [
        {
          id: "label-id",
          tally: 2,
          children: [
            {
              id: "value-id",
              tally: 2,
            },
          ],
        },
      ],
    }

    const result = await createInterpretations([nodeTree])

    expect(result).toStrictEqual([
      {
        category: nodeTree.id,
        attributes: [nodeTree.children[0].children[0].id],
        score: 2,
        probability: 2,
      },
    ])
  })

  it("handles unexpressed labels", async () => {
    const nodeTree = {
      id: "category-id",
      tally: 3,
      children: [
        {
          id: "label-id",
          tally: 1,
          children: null,
        },
      ],
    }

    const result = await createInterpretations([nodeTree])

    expect(result).toStrictEqual([
      {
        category: nodeTree.id,
        attributes: [],
        score: 1,
        probability: 2,
      },
    ])
  })

  it("handles categories without labels", async () => {
    const nodeTree = {
      id: "category-id",
      tally: 1,
      children: null,
    }

    const result = await createInterpretations([nodeTree])

    expect(result).toStrictEqual([
      {
        category: nodeTree.id,
        attributes: [],
        score: 1,
        probability: 1,
      },
    ])
  })
})
