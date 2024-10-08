import { expect, describe, it } from "vitest"
import { createInterpretations } from "./interpretations.js"

describe("createInterpretations", () => {
  const WORDS = ["asdf"]

  it("returns interpretations", async () => {
    const nodeTree = {
      id: "2b3a9822-a8bd-4b13-9393-6640ce7bade3",
      tally: 3,
      children: [{
        id: "2f311f14-b613-4a0d-ba84-5094d06cf3b6",
        tally: 1,
        children: null,
      }],
    }

    const result = await createInterpretations(WORDS, [nodeTree])

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
      id: "2b3a9822-a8bd-4b13-9393-6640ce7bade3",
      tally: 1,
      children: null,
    }

    const result = await createInterpretations(WORDS, [nodeTree])

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
