import { expect, describe, it } from "vitest"
import { normalize } from "./normalize.js"

describe("normalize", () => {
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

  it("handles labels without values", async () => {
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
        properties: [
          {
            label: LABEL,
          },
        ],
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

  it("handles multiple labels and values", async () => {
    const LABEL2 = {
      ...LABEL,
      name: `${LABEL.name}-2`,
    }
    const root = {
      ...CATEGORY,
      children: [
        {
          ...LABEL,
          children: [
            {
              name: "value-1",
              tally: 1,
            },
            {
              name: "value-2",
              tally: 1,
            },
          ],
        },
        {
          ...LABEL2,
          children: [
            {
              name: "value-3",
              tally: 1,
            },
            {
              name: "value-4",
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
            value: {
              name: "value-3",
              tally: 1,
            },
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
            value: {
              name: "value-4",
              tally: 1,
            },
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: {
              name: "value-1",
              tally: 1,
            },
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
            value: {
              name: "value-1",
              tally: 1,
            },
          },
          {
            label: LABEL2,
            value: {
              name: "value-3",
              tally: 1,
            },
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: {
              name: "value-1",
              tally: 1,
            },
          },
          {
            label: LABEL2,
            value: {
              name: "value-4",
              tally: 1,
            },
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: {
              name: "value-2",
              tally: 1,
            },
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
            value: {
              name: "value-2",
              tally: 1,
            },
          },
          {
            label: LABEL2,
            value: {
              name: "value-3",
              tally: 1,
            },
          },
        ],
      },
      {
        category: CATEGORY,
        properties: [
          {
            label: LABEL,
            value: {
              name: "value-2",
              tally: 1,
            },
          },
          {
            label: LABEL2,
            value: {
              name: "value-4",
              tally: 1,
            },
          },
        ],
      },
    ])
  })

  it("ignore already-present names", async () => {
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

    const result = await normalize(root)

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
})
