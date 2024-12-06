import { expect, describe, it } from "vitest"
import { extractValues, type Value } from "./extractValues"

describe("extractValues", () => {
  it("adds new titles as values", () => {
    const values = [] as Value[]
    const result = extractValues("jeans camel", values)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "camel"],
        sentences: [expect.any(String)],
      },
    ])
  })

  it("preserves existing values", () => {
    const values = [
      {
        name: ["jeans", "camel"],
        sentences: ["6306bdb2-e04f-4168-9b48-406d1f92cf2c"],
      },
    ] as Value[]
    const result = extractValues("vaqueros azul", values)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "camel"],
        sentences: ["6306bdb2-e04f-4168-9b48-406d1f92cf2c"],
      },
      {
        name: ["vaqueros", "azul"],
        sentences: [expect.any(String)],
      },
    ])
  })
})
