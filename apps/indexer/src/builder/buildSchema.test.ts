import { expect, describe, it } from "vitest"
import { buildSchema } from "./buildSchema.js"

describe("buildSchema", () => {
  it("recognizes new titles as categories", () => {
    const titles = ["jeans cropped", "jegging"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "cropped"],
      },
      {
        name: ["jegging"],
      },
    ])
  })

  it("common initial words become a parent category", () => {
    const titles = ["jeans cropped azul", "jeans cropped camel"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "cropped"],
        categories: [{ name: ["azul"] }, { name: ["camel"] }],
      },
    ])
  })
})