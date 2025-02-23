import { expect, describe, it } from "vitest"
import { addToSchema as addRaw } from "./addToSchema.js"
import { type TreeNode, Schema } from "./nodesToSchema.js"

describe("addToSchema", () => {
  const addToSchema = (title: string, rootNode: TreeNode) => {
    const result = addRaw(title, Schema(rootNode))
    return result.asTree()
  }

  it.skip("works", () => {
    const initialSchema = {
      name: [],
      properties: [],
      children: [],
    } as TreeNode
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
      "jeans culotte lavado sostenible",
      "jeans slim lavado medio ensuciado",
      "jeans regular lavado oscuro",
      "jeans regular negro lavado",
      "jeans regular lavado medio oscuro",
      "jeans mom algodón",
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

    const result = titles
      .reduce((schema, title) => addRaw(title, schema), Schema(initialSchema))
      .asTree()

    expect(result).toStrictEqual(initialSchema)
  })

  it("recognizes new titles as categories", () => {
    const schema = {
      name: [],
      properties: [],
      children: [],
    }
    const result = addToSchema("jeans cropped", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans", "cropped"],
          properties: [],
          children: [],
        },
      ],
    })
  })

  it("preserves existing categories", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans", "cropped"],
          children: [],
          properties: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jegging", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans", "cropped"],
          children: [],
          properties: [],
        },
        {
          name: ["jegging"],
          children: [],
          properties: [],
        },
      ],
    })
  })

  it("matches existing categories", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans", "cropped"],
          children: [],
          properties: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans cropped", schema)

    expect(result).toStrictEqual(schema)
  })

  it("adds new child nodes", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          children: [],
          properties: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans camel", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["camel"],
              children: [],
              properties: [],
            },
          ],
        },
      ],
    })
  })

  it("adds multi-word children", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          children: [],
          properties: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans cropped marine camel", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["cropped", "marine", "camel"],
              children: [],
              properties: [],
            },
          ],
        },
      ],
    })
  })

  it("splits partially matches nodes", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans", "cropped"],
          children: [],
          properties: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["cropped"],
              children: [],
              properties: [],
            },
          ],
        },
      ],
    })
  })

  it("splits child nodes", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          children: [
            {
              name: ["cropped", "azul"],
              children: [],
              properties: [],
            },
          ],
          properties: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans cropped", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["cropped"],
              children: [
                {
                  name: ["azul"],
                  children: [],
                  properties: [],
                },
              ],
              properties: [],
            },
          ],
        },
      ],
    })
  })

  it("splits and adds nodes", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans", "cropped", "azul"],
          children: [],
          properties: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans cropped camel", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans", "cropped"],
          properties: [],
          children: [
            {
              name: ["azul"],
              children: [],
              properties: [],
            },
            {
              name: ["camel"],
              children: [],
              properties: [],
            },
          ],
        },
      ],
    })
  })

  it("preserves other root categories when matching", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jegging"],
          children: [],
          properties: [],
        },
        {
          name: ["jeans", "azul"],
          children: [],
          properties: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans camel", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jegging"],
          properties: [],
          children: [],
        },
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["azul"],
              properties: [],
              children: [],
            },
            {
              name: ["camel"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    })
  })

  it("matches subcategories", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["azul"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans azul", schema)

    expect(result).toStrictEqual(schema)
  })

  it("recognizes new subcategories", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["azul"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans camel", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["azul"],
              properties: [],
              children: [],
            },
            {
              name: ["camel"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    })
  })

  it("preserves subcategories when splitting a category", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans", "cropped"],
          properties: [],
          children: [
            {
              name: ["azul"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans culotte", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["cropped"],
              properties: [],
              children: [
                {
                  name: ["azul"],
                  properties: [],
                  children: [],
                },
              ],
            },
            {
              name: ["culotte"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    })
  })

  it("splits subcategories with common words", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["cropped", "azul"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans cropped camel", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["cropped"],
              properties: [],
              children: [
                {
                  name: ["azul"],
                  properties: [],
                  children: [],
                },
                {
                  name: ["camel"],
                  properties: [],
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it("converts subcategories into properties", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [],
        },
        {
          name: ["vaqueros"],
          properties: [],
          children: [
            {
              name: ["azul"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans azul", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [
        {
          name: ["azul"],
          properties: [],
          children: [],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [],
        },
        {
          name: ["vaqueros"],
          properties: [],
          children: [],
        },
      ],
    })
  })

  it("extracts child properties", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["cropped"],
              properties: [],
              children: [
                {
                  name: ["azul"],
                  properties: [],
                  children: [],
                },
              ],
            },
            {
              name: ["pockets"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans pockets azul", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [
            {
              name: ["azul"],
              properties: [],
              children: [],
            },
          ],
          children: [
            {
              name: ["cropped"],
              properties: [],
              children: [],
            },
            {
              name: ["pockets"],
              children: [],
              properties: [],
            },
          ],
        },
      ],
    })
  })

  it("matches existing properties", () => {
    const schema = {
      name: [],
      properties: [
        {
          name: ["azul"],
          properties: [],
          children: [],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans azul", schema)

    expect(result).toStrictEqual(schema)
  })

  it("matches child properties", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [
            {
              name: ["azul"],
              properties: [],
              children: [],
            },
          ],
          children: [
            {
              name: ["cropped"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans cropped azul", schema)

    expect(result).toStrictEqual(schema)
  })

  it("identifies newly-split properties", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["cropped"],
              properties: [],
              children: [
                {
                  name: ["azul"],
                  properties: [],
                  children: [],
                },
              ],
            },
            {
              name: ["pockets", "azul"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans pockets camel", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [
            {
              name: ["azul"],
              properties: [],
              children: [],
            },
          ],
          children: [
            {
              name: ["cropped"],
              properties: [],
              children: [],
            },
            {
              name: ["pockets"],
              properties: [],
              children: [
                {
                  name: ["camel"],
                  properties: [],
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it("extracts multiple properties", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["cropped"],
              properties: [],
              children: [
                {
                  name: ["azul"],
                  properties: [],
                  children: [],
                },
                {
                  name: ["camel"],
                  properties: [],
                  children: [],
                },
              ],
            },
            {
              name: ["pockets", "azul"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans pockets camel", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [
            {
              name: ["camel"],
              properties: [],
              children: [],
            },
            {
              name: ["azul"],
              properties: [],
              children: [],
            },
          ],
          children: [
            {
              name: ["cropped"],
              properties: [],
              children: [],
            },
            {
              name: ["pockets"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    })
  })

  it("preserves follow-up children when splitting", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["slim", "straight"],
              properties: [],
              children: [],
            },
            {
              name: ["culotte"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans slim lavado", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["slim"],
              properties: [],
              children: [
                {
                  name: ["straight"],
                  properties: [],
                  children: [],
                },
                {
                  name: ["lavado"],
                  properties: [],
                  children: [],
                },
              ],
            },
            {
              name: ["culotte"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    })
  })

  it("splits partial property matches", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["cropped"],
              properties: [],
              children: [
                {
                  name: ["azul", "oscuro"],
                  properties: [],
                  children: [],
                },
              ],
            },
            {
              name: ["regular"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans regular azul lavado", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [
            {
              name: ["azul"],
              properties: [],
              children: [
                {
                  name: ["lavado"],
                  properties: [],
                  children: [],
                },
                {
                  name: ["oscuro"],
                  properties: [],
                  children: [],
                },
              ],
            },
          ],
          children: [
            {
              name: ["cropped"],
              properties: [],
              children: [],
            },
            {
              name: ["regular"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    })
  })

  it("creates property subcategories", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [
            {
              name: ["azul"],
              properties: [],
              children: [],
            },
          ],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans azul oscuro", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["jeans"],
          properties: [
            {
              name: ["azul"],
              properties: [],
              children: [
                {
                  name: ["oscuro"],
                  properties: [],
                  children: [],
                },
              ],
            },
          ],
          children: [],
        },
      ],
    })
  })

  it("matches property children", () => {
    const schema = {
      name: [],
      properties: [
        {
          name: ["azul"],
          properties: [],
          children: [
            {
              name: ["oscuro"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans azul oscuro", schema)

    expect(result).toStrictEqual(schema)
  })

  it("adds multi-words children with properties present", () => {
    const schema = {
      name: [],
      properties: [
        {
          name: ["azul"],
          properties: [],
          children: [],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans verde kaki", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [
        {
          name: ["azul"],
          properties: [],
          children: [],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["verde", "kaki"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    })
  })

  it("matches properties after unmatched words", () => {
    const schema = {
      name: [],
      properties: [
        {
          name: ["azul"],
          properties: [],
          children: [],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans flare azul", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [
        {
          name: ["azul"],
          properties: [],
          children: [],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [
            {
              name: ["flare"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
    })
  })

  it("matches properties out of order", () => {
    const schema = {
      name: [],
      properties: [
        {
          name: ["negro"],
          properties: [],
          children: [],
        },
        {
          name: ["azul"],
          properties: [],
          children: [],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans azul", schema)

    expect(result).toStrictEqual(schema)
  })

  it("matches multiple properties", () => {
    const schema = {
      name: [],
      properties: [
        {
          name: ["negro"],
          properties: [],
          children: [],
        },
        {
          name: ["azul"],
          properties: [],
          children: [],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans negro azul", schema)

    expect(result).toStrictEqual(schema)
  })

  it("extracts properties of properties", () => {
    const schema = {
      name: [],
      properties: [
        {
          name: ["lavado"],
          properties: [],
          children: [
            {
              name: ["medio"],
              properties: [],
              children: [
                {
                  name: ["ensuciado"],
                  properties: [],
                  children: [],
                },
              ],
            },
            {
              name: ["oscuro"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans lavado oscuro ensuciado", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [
        {
          name: ["lavado"],
          properties: [
            {
              name: ["ensuciado"],
              properties: [],
              children: [],
            },
          ],
          children: [
            {
              name: ["medio"],
              properties: [],
              children: [],
            },
            {
              name: ["oscuro"],
              properties: [],
              children: [],
            },
          ],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [],
        },
      ],
    })
  })

  it("matches properties of properties", () => {
    const schema = {
      name: [],
      properties: [
        {
          name: ["lavado"],
          properties: [
            {
              name: ["ensuciado"],
              properties: [],
              children: [],
            },
          ],
          children: [],
        },
      ],
      children: [
        {
          name: ["jeans"],
          properties: [],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("jeans lavado ensuciado", schema)

    expect(result).toStrictEqual(schema)
  })

  it("allows initial unknown words", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["pantalón"],
          properties: [],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("adidas pantalón", schema)

    expect(result).toStrictEqual({
      name: [],
      properties: [],
      children: [
        {
          name: ["pantalón"],
          properties: [
            {
              name: ["adidas"],
              properties: [],
              children: [],
            },
          ],
          children: [],
        },
      ],
    })
  })

  it("matches initial common properties", () => {
    const schema = {
      name: [],
      properties: [
        {
          name: ["adidas"],
          properties: [],
          children: [],
        },
      ],
      children: [
        {
          name: ["pantalón"],
          properties: [],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("adidas pantalón", schema)

    expect(result).toStrictEqual(schema)
  })

  it("matches initial child properties", () => {
    const schema = {
      name: [],
      properties: [],
      children: [
        {
          name: ["pantalón"],
          properties: [
            {
              name: ["adidas"],
              properties: [],
              children: [],
            },
          ],
          children: [],
        },
      ],
    } as TreeNode

    const result = addToSchema("adidas pantalón", schema)

    expect(result).toStrictEqual(schema)
  })
})
