import { expect, describe, it } from "vitest"
import { addToSchema, type Node } from "./addToSchema.js"

describe("addToSchema", () => {
  it.skip("works", () => {
    const titles = [
      "jeans cropped marine azul",
      "jeans cropped marine negro",
      "jeans cropped marine camel",
      "jeans high waist pockets azul",
      "jeans high waist pockets azul oscuro",
      "jeans high waist pockets camel",
      // "jeans flare azul",
      // "jeans flare verde kaki",
      // "jeans slim straight lavado claro",
      // "jeans culotte lavado sostenibl",
      // "jeans slim lavado medio ensuciao",
      // "jeans regular lavado oscur",
      // "jeans regular negro lavad",
      // "jeans regular lavado medio oscuo",
      // "jeans mom algodó",
      // "jeans kick flare lavado sostenible",
      // "jeans skinny lavado medio ensuciado",
      // "jeans straight lavado sostenible",
      // "jeans skinny negro lavado",
      // "jeans regular lavado claro",
      // "jeans slim cropped lavado sostenible",
      // "jeans skinny lavado claro",
      // "jeans push up lavado sostenible",
      // "jeans slim ligero azul verdoso lavado medio oscuro",
      // "jeans slim lavado medio oscuro",
      // "jeans culotte lavado sostenible",
      // "jeans boot cut lavado sostenible",
      // "jeans slim ligero lavado medio",
      // "jeans slim ligero lavado medio claro",
      // "jeans slim gris lavado claro",
      // "jeans regular relax negro lavado",
      // "jeans slim lavado claro",
      // "jeans regular lavado oscuro ensuciado",
      // "jeans regular lavado claro",
      // "jean 501® levi's® original",
      // "jean infantil de corte estrecho 510™",
      // "jean de corte cónico ceñido 512™",
      // "jean de corte cónico ceñido 512™",
    ]

    const result = titles.reduce((schema, title) => addToSchema(title, schema), [] as Node[])

    expect(result).toStrictEqual([])
  })

  it("recognizes new titles as categories", () => {
    const result = addToSchema("jeans cropped", [])

    expect(result).toStrictEqual([
      {
        name: ["jeans", "cropped"],
        children: [],
      },
    ])
  })

  it("preserves existing categories", () => {
    const schema = [
      {
        name: ["jeans", "cropped"],
        children: [],
      },
    ] as Node[]

    const result = addToSchema("jegging", schema)

    expect(result).toStrictEqual([
      schema[0],
      {
        name: ["jegging"],
        children: [],
      },
    ])
  })

  it("matches existing categories", () => {
    const schema = [
      {
        name: ["jeans", "cropped"],
        children: [],
      },
    ] as Node[]

    const result = addToSchema("jeans cropped", schema)

    expect(result).toStrictEqual(schema)
  })

  it("common initial words become a parent category", () => {
    const schema = [
      {
        name: ["jeans", "cropped", "azul"],
        children: [],
      },
    ] as Node[]

    const result = addToSchema("jeans cropped camel", schema)

    expect(result).toStrictEqual([
      {
        name: ["jeans", "cropped"],
        children: [
          {
            name: ["azul"],
            children: [],
          },
          {
            name: ["camel"],
            children: [],
          },
        ],
      },
    ])
  })

  it("preserves other root categories when matching", () => {
    const schema = [
      {
        name: ["jegging"],
        children: [],
      },
      {
        name: ["jeans", "azul"],
        children: [],
      },
    ] as Node[]

    const result = addToSchema("jeans camel", schema)

    expect(result).toStrictEqual(
      [
        {
          name: ["jegging"],
          children: [],
        },
        {
          name: ["jeans"],
          children: [
            {
              name: ["azul"],
              children: [],
            },
            {
              name: ["camel"],
              children: [],
            },
          ],
        },
      ])
  })

  it("matches subcategories", () => {
    const schema = [
      {
        name: ["jeans"],
        children: [
{
              name: ["azul"],
              children: [],
            }
        ],
      },
    ] as Node[]

    const result = addToSchema("jeans azul", schema)

    expect(result).toStrictEqual(schema)
  })

  it("recognizes new subcategories", () => {
    const schema = [
      {
        name: ["jeans"],
        children: [
{
              name: ["azul"],
              children: [],
            }
        ],
      },
    ] as Node[]

    const result = addToSchema("jeans camel", schema)

    expect(result).toStrictEqual([
      {
        name: ["jeans"],
        children: [
          {
            name: ["azul"],
            children: [],
          },
          {
            name: ["camel"],
            children: [],
          }
        ],
      },
    ])
  })

  it("preserves subcategories when splitting a category", () => {
    const schema = [
      {
        name: ["jeans", "cropped"],
        children: [
          {
            name: ["azul"],
            children: [],
          }
        ],
      },
    ] as Node[]

    const result = addToSchema("jeans culotte", schema)

    expect(result).toStrictEqual([
      {
        name: ["jeans"],
        children: [
          {
            name: ["cropped"],
            children: [
              {
                name: ["azul"],
                children: [],
              },
            ],
          },
          {
            name: ["culotte"],
            children: [],
          },
        ],
      },
    ])
  })

  it("splits subcategories with common words", () => {
    const schema = [
      {
        name: ["jeans"],
        children: [
          {
            name: ["cropped", "azul"],
            children: [],
          }
        ],
      },
    ] as Node[]

    const result = addToSchema("jeans cropped camel", schema)

    expect(result).toStrictEqual([
      {
        name: ["jeans"],
        children: [
          {
            name: ["cropped"],
            children: [
              {
                name: ["azul"],
                children: [],
              },
              {
                name: ["camel"],
                children: [],
              },
            ],
          },
        ],
      },
    ])
  })

  it("converts common subcategories into properties", () => {
    const schema = [
      {
        name: ["jeans"],
        children: [
          {
            name: ["cropped"],
            children: [
              {
                name: ["azul"],
                children: [],
              }
            ],
          },
          {
            name: ["pockets"],
            children: [],
          }
        ],
      },
    ] as Node[]

    const result = addToSchema("jeans pockets azul", schema)

    expect(result).toStrictEqual([
      {
        name: ["jeans"],
        properties: [
          {
            name: ["azul"],
            children: [],
          },
        ],
        children: [
          {
            name: ["cropped"],
            children: [],
          },
          {
            name: ["pockets"],
            children: [],
          },
        ],
      },
    ])
  })
})
