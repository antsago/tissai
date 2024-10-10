import { expect, describe, it } from "vitest"
import { createInterpretations } from "./interpretations.js"

describe("createInterpretations", () => {
  it.only("returns interpretations", async () => {
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

    const result = await createInterpretations([nodeTree])

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

  it("handles unexpressed labels", async () => {
    const nodeTree = {
      name: "category-name",
      tally: 3,
      children: [
        {
          name: "label-name",
          tally: 1,
          children: null,
        },
      ],
    }

    const result = await createInterpretations([nodeTree])

    expect(result).toStrictEqual([
      {
        category: nodeTree.name,
        attributes: [],
        score: 1,
        probability: 2,
      },
    ])
  })

  it("handles categories without labels", async () => {
    const nodeTree = {
      name: "category-name",
      tally: 1,
      children: null,
    }

    const result = await createInterpretations([nodeTree])

    expect(result).toStrictEqual([
      {
        category: nodeTree.name,
        attributes: [],
        score: 1,
        probability: 1,
      },
    ])
  })

  it("handles several categories", async () => {
    const fullTree = {
      name: "categor-1-name",
      tally: 5,
      children: [
        {
          name: "label-name",
          tally: 3,
          children: [
            {
              name: "value-name",
              tally: 1,
            },
          ],
        },
      ],
    }
    const categoryTree = {
      name: "category-2-name",
      tally: 1,
      children: null,
    }

    const result = await createInterpretations([fullTree, categoryTree])

    expect(result).toStrictEqual([
      {
        category: fullTree.name,
        attributes: [fullTree.children[0].children[0].name],
        score: 2,
        probability: 1,
      },
      {
        category: categoryTree.name,
        attributes: [],
        score: 1,
        probability: categoryTree.tally,
      },
    ])
  })

  it("handles multiple labels", async () => {
    const nodeTree = {
      name: "category-name",
      tally: 3,
      children: [
        {
          name: "label-1-name",
          tally: 2,
          children: [
            {
              name: "value-name",
              tally: 2,
            },
          ],
        },
        {
          name: "label-2-name",
          tally: 1,
          children: null,
        },
      ],
    }

    const result = await createInterpretations([nodeTree])

    expect(result).toStrictEqual([
      {
        category: nodeTree.name,
        attributes: [nodeTree.children[0].children![0].name],
        score: 2,
        probability:
          nodeTree.tally *
          (nodeTree.children![0].tally / nodeTree.tally) *
          ((nodeTree.tally - nodeTree.children[1].tally) / nodeTree.tally),
      },
    ])
  })

  it("handles multiple values", async () => {
    const nodeTree = {
      name: "category-name",
      tally: 5,
      children: [
        {
          name: "label-name",
          tally: 3,
          children: [
            {
              name: "value-1-name",
              tally: 2,
            },
            {
              name: "value-2-name",
              tally: 1,
            },
          ],
        },
      ],
    }

    const result = await createInterpretations([nodeTree])

    expect(result).toStrictEqual([
      {
        category: nodeTree.name,
        attributes: [nodeTree.children[0].children[0].name],
        score: 2,
        probability: 2,
      },
      {
        category: nodeTree.name,
        attributes: [nodeTree.children[0].children[1].name],
        score: 2,
        probability: 1,
      },
    ])
  })

  it("handles multiple labels with multiple values", async () => {
    const root = {
      name: "category-name",
      tally: 5,
      children: [
        {
          name: "label-1-name",
          tally: 2,
          children: [
            {
              name: "value-1-name",
              tally: 1,
            },
            {
              name: "value-2-name",
              tally: 1,
            },
          ],
        },
        {
          name: "label-2-name",
          tally: 4,
          children: [
            {
              name: "value-3-name",
              tally: 2,
            },
            {
              name: "value-4-name",
              tally: 1,
            },
          ],
        },
      ],
    }

    const result = await createInterpretations([root])

    expect(result).toStrictEqual([
      {
        category: root.name,
        attributes: [
          root.children[0].children[0].name,
          root.children[1].children[0].name,
        ],
        score: 3,
        probability:
          root.tally *
          (root.children[0].children[0].tally / root.tally) *
          (root.children[1].children[0].tally / root.tally),
      },
      {
        category: root.name,
        attributes: [
          root.children[0].children[0].name,
          root.children[1].children[1].name,
        ],
        score: 3,
        probability:
          root.tally *
          (root.children[0].children[0].tally / root.tally) *
          (root.children[1].children[1].tally / root.tally),
      },
      {
        category: root.name,
        attributes: [
          root.children[0].children[1].name,
          root.children[1].children[0].name,
        ],
        score: 3,
        probability:
          root.tally *
          (root.children[0].children[1].tally / root.tally) *
          (root.children[1].children[0].tally / root.tally),
      },
      {
        category: root.name,
        attributes: [
          root.children[0].children[1].name,
          root.children[1].children[1].name,
        ],
        score: 3,
        probability:
          root.tally *
          (root.children[0].children[1].tally / root.tally) *
          (root.children[1].children[1].tally / root.tally),
      },
    ])
  })
})
