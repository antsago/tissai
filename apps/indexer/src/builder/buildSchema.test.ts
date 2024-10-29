import { expect, describe, it } from "vitest"
import { buildSchema } from "./buildSchema.js"

describe("buildSchema", () => {
  it("recognizes new titles as categories", () => {
    const titles = ["jeans cropped marine azul", "jegging encerado vila"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        name: titles[0],
        properties: [],
        subcategories: [],
      },
      {
        name: titles[1],
        properties: [],
        subcategories: [],
      },
    ])
  })
})