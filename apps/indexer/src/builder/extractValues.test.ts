import { expect, describe, it } from "vitest"
import { extractValues } from "./extractValues"

describe("extractValues", () => {
  it("adds new titles as values", () => {
    const titles = ["jeans camel"]

    const result = extractValues(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "camel"],
        sentences: [expect.any(String)],
      },
    ])
  })

  it("adds several new values", () => {
    const titles = ["jeans camel", "vaqueros azul"]

    const result = extractValues(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "camel"],
        sentences: [expect.any(String)],
      },
      {
        name: ["vaqueros", "azul"],
        sentences: [expect.any(String)],
      },
    ])
  })
})
