import { expect, describe, it } from "vitest"
import { CATEGORY_NODE, LABEL_NODE } from "@tissai/db/mocks"
import { normalize } from "./normalize.js"

describe("normalize", () => {
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
    id: LABEL_NODE.id,
    name: "value",
    tally: 2,
  }

  it("identifies category and properties", () => {
    const root = {
      ...CATEGORY,
      children: [
        {
          ...LABEL,
          children: [VALUE],
        },
      ],
    }

    const result = Array.from(normalize(root))

    expect(result).toStrictEqual([
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: VALUE,
          },
        ],
      },
    ])
  })

  it("handles labels without values", () => {
    const root = {
      ...CATEGORY,
      children: [
        {
          ...LABEL,
          children: null,
        },
      ],
    }

    const result = Array.from(normalize(root))

    expect(result).toStrictEqual([
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
          },
        ],
      },
    ])
  })

  it("handles categories without labels", () => {
    const root = {
      ...CATEGORY,
      children: null,
    }

    const result = Array.from(normalize(root))

    expect(result).toStrictEqual([
      {
        category: CATEGORY,
        properties: [],
      },
    ])
  })

  it("handles multiple labels and values", () => {
    const LABEL2 = {
      ...LABEL,
      name: `${LABEL.name}-2`,
    }
    const value1 = {
      id: "value-id-1",
      name: "value-1",
      tally: 1,
    }
    const value2 = {
      id: "value-id-2",
      name: "value-2",
      tally: 1,
    }
    const value3 = {
      id: "value-id-3",
      name: "value-3",
      tally: 1,
    }
    const value4 = {
      id: "value-id-4",
      name: "value-4",
      tally: 1,
    }
    const root = {
      ...CATEGORY,
      children: [
        {
          ...LABEL,
          children: [value1, value2],
        },
        {
          ...LABEL2,
          children: [value3, value4],
        },
      ],
    }

    const result = Array.from(normalize(root))

    expect(result).toStrictEqual([
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
          },
          {
            label: LABEL2,
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
          },
          {
            label: LABEL2,
            value: value3,
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
          },
          {
            label: LABEL2,
            value: value4,
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: value1,
          },
          {
            label: LABEL2,
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: value1,
          },
          {
            label: LABEL2,
            value: value3,
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: value1,
          },
          {
            label: LABEL2,
            value: value4,
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: value2,
          },
          {
            label: LABEL2,
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: value2,
          },
          {
            label: LABEL2,
            value: value3,
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: value2,
          },
          {
            label: LABEL2,
            value: value4,
          },
        ],
      },
    ])
  })

  it("ignore already-present names", () => {
    const LABEL2 = {
      ...LABEL,
      name: `${LABEL.name}-2`,
    }
    const root = {
      ...CATEGORY,
      children: [
        {
          ...LABEL,
          children: [VALUE],
        },
        {
          ...LABEL2,
          children: [VALUE],
        },
      ],
    }

    const result = Array.from(normalize(root))

    expect(result).toStrictEqual([
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
          },
          {
            label: LABEL2,
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
          },
          {
            label: LABEL2,
            value: VALUE,
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: VALUE,
          },
          {
            label: LABEL2,
          },
        ],
      },
    ])
  })

  it("handles combinatorial explosion", () => {
    const MAX_CHILDREN = 10
    const root = {
      ...CATEGORY,
      children: new Array(MAX_CHILDREN).fill(null).map((_, labelIndex) => ({
        id: `label-id-${labelIndex}`,
        name: `label-name-${labelIndex}`,
        tally: 1,
        children: new Array(MAX_CHILDREN).fill(null).map((_, valueIndex) => ({
          id: `value-id-${labelIndex}-${valueIndex}`,
          name: `value-name-${labelIndex}-${valueIndex}`,
          tally: 1,
        })),
      })),
    }

    const act = () => normalize(root)

    expect(act).not.toThrow()
  })
})
