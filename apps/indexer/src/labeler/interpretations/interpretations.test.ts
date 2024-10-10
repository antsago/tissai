import { expect, describe, it } from "vitest"
import { createInterpretations, normalize } from "./interpretations.js"


describe("createInterpretations", () => {
  describe("normalize", () => {
    const CATEGORY = {
      id: "category-id",
      tally: 3,
    }
    const LABEL = {
      id: "label-id",
      tally: 2,
    }
    const VALUE = {
      id: "value-id",
      tally: 2,
    }

    it("identifies category and properties", async () => {
      const root = {
        ...CATEGORY,
        children: [
          {
            ...LABEL,
            children: [VALUE],
          },
        ],
      }
  
      const result = await normalize(root)
  
      expect(result).toStrictEqual([
        {
          category: CATEGORY,
          properties: [{
            label: LABEL,
            value: VALUE,
          }]
        },
      ])
    })
  
    it("handles unexpressed labels", async () => {
      const root = {
        ...CATEGORY,
        children: [
          {
            ...LABEL,
            children: null,
          },
        ],
      }
  
      const result = await normalize(root)
  
      expect(result).toStrictEqual([
        {
          category: CATEGORY,
          properties: [{
            label: LABEL,
          }]
        },
      ])
    })
  
    it("handles categories without labels", async () => {
      const root = {
        ...CATEGORY,
        children: null,
      }
  
      const result = await normalize(root)
  
      expect(result).toStrictEqual([
        {
          category: CATEGORY,
          properties: [],
        },
      ])
    })
  
    it("handles multiple labels", async () => {
      const LABEL2 = {
        ...LABEL,
        id: `${LABEL.id}-2`,
      }
      const root = {
        ...CATEGORY,
        children: [
          {
            ...LABEL,
            children: [
              VALUE,
            ],
          },
          {
            ...LABEL2,
            children: null,
          },
        ],
      }
  
      const result = await normalize(root)
  
      expect(result).toStrictEqual([
        {
          category: CATEGORY,
          properties: [
            { label: LABEL, value: VALUE },
            { label: LABEL2 }
          ]
        },
      ])
    })
  
    it("handles multiple values", async () => {
      const VALUE2 = {
        ...VALUE,
        id: `${VALUE.id}_2`,
      }
      const root = {
        ...CATEGORY,
        children: [
          {
            ...LABEL,
            children: [VALUE, VALUE2],
          },
        ],
      }
  
      const result = await normalize(root)
  
      expect(result).toStrictEqual([
        {
          category: CATEGORY,
          properties: [{
            label: LABEL,
            value: VALUE,
          }]
        },
        {
          category: CATEGORY,
          properties: [{
            label: LABEL,
            value: VALUE2,
          }]
        },
      ])
    })
  
    it("handles multiple labels with multiple values", async () => {
      const LABEL2 = {
        ...LABEL,
        id: `${LABEL.id}-2`,
      }
      const root = {
        ...CATEGORY,
        children: [
          {
            ...LABEL,
            children: [
              {
                id: "value-1-id",
                tally: 1,
              },
              {
                id: "value-2-id",
                tally: 1,
              },
            ],
          },
          {
            ...LABEL2,
            children: [
              {
                id: "value-3-id",
                tally: 1,
              },
              {
                id: "value-4-id",
                tally: 1,
              },
            ],
          },
        ],
      }
  
      const result = await normalize(root)
  
      expect(result).toStrictEqual([
        {
          category: CATEGORY,
          properties: [
            {
              label: LABEL,
              value: {
                id: "value-1-id",
                tally: 1,
              }
            },
            {
              label: LABEL2,
              value: {
                id: "value-3-id",
                tally: 1,
              }
            },
          ]
        },
        {
          category: CATEGORY,
          properties: [
            {
              label: LABEL,
              value: {
                id: "value-1-id",
                tally: 1,
              }
            },
            {
              label: LABEL2,
              value: {
                id: "value-4-id",
                tally: 1,
              }
            },
          ]
        },
        {
          category: CATEGORY,
          properties: [
            {
              label: LABEL,
              value: {
                id: "value-2-id",
                tally: 1,
              }
            },
            {
              label: LABEL2,
              value: {
                id: "value-3-id",
                tally: 1,
              }
            },
          ]
        },
        {
          category: CATEGORY,
          properties: [
            {
              label: LABEL,
              value: {
                id: "value-2-id",
                tally: 1,
              }
            },
            {
              label: LABEL2,
              value: {
                id: "value-4-id",
                tally: 1,
              }
            },
          ]
        },
      ])
    })
  })

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

  it("handles multiple values", async () => {
    const nodeTree = {
      id: "category-id",
      tally: 5,
      children: [
        {
          id: "label-id",
          tally: 3,
          children: [
            {
              id: "value-1-id",
              tally: 2,
            },
            {
              id: "value-2-id",
              tally: 1,
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
      {
        category: nodeTree.id,
        attributes: [nodeTree.children[0].children[1].id],
        score: 2,
        probability: 1,
      },
    ])
  })

  it("handles multiple labels with multiple values", async () => {
    const root = {
      id: "category-id",
      tally: 5,
      children: [
        {
          id: "label-1-id",
          tally: 2,
          children: [
            {
              id: "value-1-id",
              tally: 1,
            },
            {
              id: "value-2-id",
              tally: 1,
            },
          ],
        },
        {
          id: "label-2-id",
          tally: 4,
          children: [
            {
              id: "value-3-id",
              tally: 2,
            },
            {
              id: "value-4-id",
              tally: 1,
            },
          ],
        },
      ],
    }

    const result = await createInterpretations([root])

    expect(result).toStrictEqual([
      {
        category: root.id,
        attributes: [
          root.children[0].children[0].id,
          root.children[1].children[0].id,
        ],
        score: 3,
        probability:
          root.tally *
          (root.children[0].children[0].tally / root.tally) *
          (root.children[1].children[0].tally / root.tally),
      },
      {
        category: root.id,
        attributes: [
          root.children[0].children[0].id,
          root.children[1].children[1].id,
        ],
        score: 3,
        probability:
          root.tally *
          (root.children[0].children[0].tally / root.tally) *
          (root.children[1].children[1].tally / root.tally),
      },
      {
        category: root.id,
        attributes: [
          root.children[0].children[1].id,
          root.children[1].children[0].id,
        ],
        score: 3,
        probability:
          root.tally *
          (root.children[0].children[1].tally / root.tally) *
          (root.children[1].children[0].tally / root.tally),
      },
      {
        category: root.id,
        attributes: [
          root.children[0].children[1].id,
          root.children[1].children[1].id,
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
