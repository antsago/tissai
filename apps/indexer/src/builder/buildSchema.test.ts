import { expect, describe, it } from "vitest"
import { buildSchema } from "./buildSchema.js"

describe("buildSchema", () => {
  it.skip("works", () => {
    const titles = [
      "jeans cropped marine azul",
      "jeans cropped marine negro",
      "jeans cropped marine camel",
      "jeans high waist pockets azul",
      "jeans high waist pockets azul oscuro",
      "jeans high waist pockets camel",
      "jeans flare azul",
      "jeans flare verde kaki",
      "jeans slim straight lavado claro",
      "jeans culotte lavado sostenibl",
      "jeans slim lavado medio ensuciao",
      "jeans regular lavado oscur",
      "jeans regular negro lavad",
      "jeans regular lavado medio oscuo",
      "jeans mom algodó",
      "jeans kick flare lavado sostenible",
      "jeans skinny lavado medio ensuciado",
      "jeans straight lavado sostenible",
      "jeans skinny negro lavado",
      "jeans regular lavado claro",
      "jeans slim cropped lavado sostenible",
      "jeans skinny lavado claro",
      "jeans push up lavado sostenible",
      "jeans slim ligero azul verdoso lavado medio oscuro",
      "jeans slim lavado medio oscuro",
      "jeans culotte lavado sostenible",
      "jeans boot cut lavado sostenible",
      "jeans slim ligero lavado medio",
      "jeans slim ligero lavado medio claro",
      "jeans slim gris lavado claro",
      "jeans regular relax negro lavado",
      "jeans slim lavado claro",
      "jeans regular lavado oscuro ensuciado",
      "jeans regular lavado claro",
      "jean 501® levi's® original",
      "jean infantil de corte estrecho 510™",
      "jean de corte cónico ceñido 512™",
      "jean de corte cónico ceñido 512™",
    ]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([])
  })

  it("recognizes new titles as categories", () => {
    const titles = ["jeans cropped", "jegging"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        name: ["jeans", "cropped"],
        parent: null,
        children: [],
      },
      {
        id: expect.any(String),
        name: ["jegging"],
        parent: null,
        children: [],
      },
    ])
  })

  it("common initial words become a parent category", () => {
    const titles = ["jeans cropped azul", "jeans cropped camel"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        name: ["jeans", "cropped"],
        parent: null,
        children: [
          {
            id: expect.any(String),
            name: ["azul"],
            parent: result[0].id,
            children: [],
          },
          {
            id: expect.any(String),
            parent: result[0].id,
            name: ["camel"],
            children: [],
          },
        ],
      },
    ])
  })

  it("preserves other root categories when matching", () => {
    const titles = ["jegging", "jeans azul", "jeans camel"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        name: ["jegging"],
        parent: null,
        children: [],
      },
      {
        id: expect.any(String),
        name: ["jeans"],
        parent: null,
        children: [
          {
            id: expect.any(String),
            name: ["azul"],
            parent: result[1].id,
            children: [],
          },
          {
            id: expect.any(String),
            name: ["camel"],
            parent: result[1].id,
            children: [],
          },
        ],
      },
    ])
  })

  it("matches root categories", () => {
    const titles = ["jeans cropped", "jeans cropped"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        name: ["jeans", "cropped"],
        parent: null,
        children: [],
      },
    ])
  })

  it("matches subcategories", () => {
    const titles = ["jeans azul", "jeans camel", "jeans azul"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        name: ["jeans"],
        parent: null,
        children: [
          {
            id: expect.any(String),
            parent: result[0].id,
            name: ["azul"],
            children: [],
          },
          {
            id: expect.any(String),
            parent: result[0].id,
            name: ["camel"],
            children: [],
          },
        ],
      },
    ])
  })

  it("recognizes new subcategories", () => {
    const titles = ["jeans azul", "jeans camel", "jeans negro"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        name: ["jeans"],
        parent: null,
        children: [
          {
            id: expect.any(String),
            name: ["azul"],
            parent: result[0].id,
            children: [],
          },
          {
            id: expect.any(String),
            name: ["camel"],
            parent: result[0].id,
            children: [],
          },
          {
            id: expect.any(String),
            name: ["negro"],
            parent: result[0].id,
            children: [],
          },
        ],
      },
    ])
  })

  it("preserves subcategories when splitting a category", () => {
    const titles = [
      "jeans cropped azul",
      "jeans cropped camel",
      "jeans culotte",
    ]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        name: ["jeans"],
        parent: null,
        children: [
          {
            id: expect.any(String),
            name: ["cropped"],
            parent: result[0].id,
            children: [
              {
                id: expect.any(String),
                name: ["azul"],
                parent: result[0].children[0].id,
                children: [],
              },
              {
                id: expect.any(String),
                parent: result[0].children[0].id,
                name: ["camel"],
                children: [],
              },
            ],
          },
          {
            id: expect.any(String),
            name: ["culotte"],
            parent: result[0].id,
            children: [],
          },
        ],
      },
    ])
  })

  it("splits subcategories with common words", () => {
    const titles = ["jeans", "jeans cropped azul", "jeans cropped camel"]

    const result = buildSchema(titles)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        name: ["jeans"],
        parent: null,
        children: [
          {
            id: expect.any(String),
            name: ["cropped"],
            parent: result[0].id,
            children: [
              {
                id: expect.any(String),
                name: ["azul"],
                parent: result[0].children[0].id,
                children: [],
              },
              {
                id: expect.any(String),
                name: ["camel"],
                parent: result[0].children[0].id,
                children: [],
              },
            ],
          },
        ],
      },
    ])
  })
})
