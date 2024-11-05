import { expect, describe, it } from "vitest"
import { buildSchema } from "./buildSchema.js"

describe("buildSchema", () => {
  it.skip("works", () => {
    const titles = [
      "jeans cropped marine azul",
      "jeans cropped marine camel",
      "jeans cropped marine negro",
      "jeans culotte lavado sostenible",
      "jeans culotte lavado sostenible",
    ]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([])
  })

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

  it("preserves other root categories when matching", () => {
    const titles = ["jegging", "jeans azul", "jeans camel"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        name: ["jegging"],
      },
      {
        name: ["jeans"],
        categories: [{ name: ["azul"] }, { name: ["camel"] }],
      },
    ])
  })

  it("matches root categories", () => {
    const titles = ["jeans cropped", "jeans cropped"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "cropped"],
      },
    ])
  })

  it("matches subcategories", () => {
    const titles = [
      "jeans cropped azul",
      "jeans cropped camel",
      "jeans cropped azul",
    ]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "cropped"],
        categories: [{ name: ["azul"] }, { name: ["camel"] }],
      },
    ])
  })

  it("recognizes new subcategories", () => {
    const titles = [
      "jeans cropped azul",
      "jeans cropped camel",
      "jeans cropped negro",
    ]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "cropped"],
        categories: [
          { name: ["azul"] },
          { name: ["camel"] },
          { name: ["negro"] },
        ],
      },
    ])
  })
})
