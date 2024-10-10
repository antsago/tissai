import { expect, describe, it } from "vitest"
import { normalize } from "./normalize.js"

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
