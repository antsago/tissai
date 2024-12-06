import { expect, describe, it } from "vitest"
import { extractValues } from "./extractValues"

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
