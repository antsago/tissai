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
        id: expect.any(String),
        name: ["jeans", "cropped"],
        parent: null,
        children: [],
      },
    ])
  })

  it("preserves existing categories", () => {
    const schema = [
      {
        id: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
        name: ["jeans", "cropped"],
        parent: null,
        children: [],
      },
    ] as Node[]

    const result = addToSchema("jegging", schema)

    expect(result).toStrictEqual([
      schema[0],
      {
        id: expect.any(String),
        name: ["jegging"],
        parent: null,
        children: [],
      },
    ])
  })

  it("matches existing categories", () => {
    const schema = [
      {
        id: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
        name: ["jeans", "cropped"],
        parent: null,
        children: [],
      },
    ] as Node[]

    const result = addToSchema("jeans cropped", schema)

    expect(result).toStrictEqual(schema)
  })

  it("common initial words become a parent category", () => {
    const schema = [
      {
        id: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
        name: ["jeans", "cropped", "azul"],
        parent: null,
        children: [],
      },
    ] as Node[]

    const result = addToSchema("jeans cropped camel", schema)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        parent: null,
        name: ["jeans", "cropped"],
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
    const schema = [
      {
        id: "b0a18c36-a729-4544-ac5f-b90394acc324",
        name: ["jegging"],
        parent: null,
        children: [],
      },
      {
        id: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
        parent: null,
        name: ["jeans", "azul"],
        children: [],
      },
    ] as Node[]

    const result = addToSchema("jeans camel", schema)

    expect(result).toStrictEqual(
      [
        {
          id: "b0a18c36-a729-4544-ac5f-b90394acc324",
          name: ["jegging"],
          parent: null,
          children: [],
        },
        {
          id: expect.any(String),
          parent: null,
          name: ["jeans"],
          children: [
            {
              id: expect.any(String),
              name: ["azul"],
              parent: result[1].id,
              children: [],
            },
            {
              id: expect.any(String),
              parent: result[1].id,
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
        id: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
        parent: null,
        name: ["jeans"],
        children: [
{
        id: "b0a18c36-a729-4544-ac5f-b90394acc324",
              name: ["azul"],
              parent: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
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
        id: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
        parent: null,
        name: ["jeans"],
        children: [
{
        id: "b0a18c36-a729-4544-ac5f-b90394acc324",
              name: ["azul"],
              parent: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
              children: [],
            }
        ],
      },
    ] as Node[]

    const result = addToSchema("jeans camel", schema)

    expect(result).toStrictEqual([
      {
        id: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
        parent: null,
        name: ["jeans"],
        children: [
          {
            id: "b0a18c36-a729-4544-ac5f-b90394acc324",
            name: ["azul"],
            parent: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
            children: [],
          },
          {
            id: expect.any(String),
            name: ["camel"],
            parent: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
            children: [],
          }
        ],
      },
    ])
  })

  it("preserves subcategories when splitting a category", () => {
    const schema = [
      {
        id: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
        parent: null,
        name: ["jeans", "cropped"],
        children: [
          {
            id: "b0a18c36-a729-4544-ac5f-b90394acc324",
            name: ["azul"],
            parent: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
            children: [],
          }
        ],
      },
    ] as Node[]

    const result = addToSchema("jeans culotte", schema)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        parent: null,
        name: ["jeans"],
        children: [
          {
            id: expect.any(String),
            parent: result[0].id,
            name: ["cropped"],
            children: [
              {
                id: expect.any(String),
                name: ["azul"],
                parent: result[0].children[0].id,
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
    const schema = [
      {
        id: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
        parent: null,
        name: ["jeans"],
        children: [
          {
            id: "b0a18c36-a729-4544-ac5f-b90394acc324",
            name: ["cropped", "azul"],
            parent: "006cb2b6-0851-4695-99cc-23a2e8a1909f",
            children: [],
          }
        ],
      },
    ] as Node[]

    const result = addToSchema("jeans cropped camel", schema)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        parent: null,
        name: ["jeans"],
        children: [
          {
            id: expect.any(String),
            parent: result[0].id,
            name: ["cropped"],
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
