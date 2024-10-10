import { expect, describe, it } from "vitest"
import { calculateProbability } from "./calculateProbability.js"

describe("calculateProbability", async () => {
  const CATEGORY = {
    name: "category",
    tally: 5,
  }
  const LABEL = {
    name: "label",
    tally: 3,
  }
  const VALUE = {
    name: "value",
    tally: 2,
  }

  it("handles categories without properties", async () => {
    const interpretation = {
      category: CATEGORY,
      properties: [],
    }

    const result = await calculateProbability(interpretation)

    expect(result).toStrictEqual(CATEGORY.tally)
  })

  it("handles unexpressed properties", async () => {
    const interpretation = {
      category: CATEGORY,
      properties: [{ label: LABEL }],
    }

    const result = await calculateProbability(interpretation)

    expect(result).toStrictEqual(CATEGORY.tally - LABEL.tally)
  })

  it("handles expressed properties", async () => {
    const interpretation = {
      category: CATEGORY,
      properties: [{ label: LABEL, value: VALUE }],
    }

    const result = await calculateProbability(interpretation)

    expect(result).toStrictEqual(VALUE.tally)
  })

  it("handles multiple properties", async () => {
    const LABEL2 = {
      name: `${LABEL.name}-2`,
      tally: CATEGORY.tally - LABEL.tally,
    }
    const interpretation = {
      category: CATEGORY,
      properties: [
        { label: LABEL, value: VALUE },
        { label: LABEL2 },
      ],
    }

    const result = await calculateProbability(interpretation)

    expect(result).toStrictEqual(CATEGORY.tally * (VALUE.tally / CATEGORY.tally) * (LABEL.tally / CATEGORY.tally))
  })
})
