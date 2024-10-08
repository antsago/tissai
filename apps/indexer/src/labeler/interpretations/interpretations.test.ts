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

  it("handles several categories", async () => {
    const fullTree = {
      id: "categor-1-id",
      tally: 5,
      children: [
        {
          id: "label-id",
          tally: 3,
          children: [
            {
              id: "value-id",
              tally: 1,
            },
          ],
        },
      ],
    }
    const categoryTree = {
      id: "category-2-id",
      tally: 1,
      children: null,
    }

    const result = await createInterpretations([fullTree, categoryTree])

    expect(result).toStrictEqual([
      {
        category: fullTree.id,
        attributes: [fullTree.children[0].children[0].id],
        score: 2,
        probability: 1,
      },
      {
        category: categoryTree.id,
        attributes: [],
        score: 1,
        probability: categoryTree.tally,
      },
    ])
  })

  it("handles multiple labels", async () => {
    const nodeTree = {
      id: "category-id",
      tally: 3,
      children: [
        {
          id: "label-1-id",
          tally: 2,
          children: [
            {
              id: "value-id",
              tally: 2,
            },
          ],
        },
        {
          id: "label-2-id",
          tally: 1,
          children: null,
        },
      ],
    }

    const result = await createInterpretations([nodeTree])

    expect(result).toStrictEqual([
      {
        category: nodeTree.id,
        attributes: [nodeTree.children[0].children![0].id],
        score: 2,
        probability:
          nodeTree.tally *
          (nodeTree.children![0].tally / nodeTree.tally) *
          ((nodeTree.tally - nodeTree.children[1].tally) / nodeTree.tally),
      },
    ])
  })
})
