import { randomUUID, type UUID } from "crypto"
import { expect, describe, it } from "vitest"

type Value = {
  name: string[],
  sentences: UUID[]
}
const extractValues = (title: string, values: Value[]) => {
  const words = title.split(" ")

  return [{
    name: words,
    sentences: [randomUUID()],
  }]
}

describe("extractValues", () => {
  it("adds new titles as values", () => {
    const values = []
    const result = extractValues("jeans camel", values)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "camel"],
        sentences: [expect.any(String)],
      },
    ])
  })
})
