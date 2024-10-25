import { describe, test, beforeEach } from "vitest"
import { dbFixture, CATEGORY_NODE, LABEL_NODE, VALUE_NODE } from "#mocks"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("nodes", () => {
  describe("match", () => {
    it("returns matching nodes", async ({ expect, db }) => {
      await db.load({
        nodes: [CATEGORY_NODE, LABEL_NODE, VALUE_NODE],
      })

      const result = await db.nodes.match([CATEGORY_NODE.name, VALUE_NODE.name])

      expect(result).toStrictEqual([
        {
          id: CATEGORY_NODE.id,
          name: CATEGORY_NODE.name,
          tally: CATEGORY_NODE.tally,
          children: [
            {
              id: LABEL_NODE.id,
              name: LABEL_NODE.name,
              tally: LABEL_NODE.tally,
              children: [
                {
                  id: VALUE_NODE.id,
                  name: VALUE_NODE.name,
                  tally: VALUE_NODE.tally,
                },
              ],
            },
          ],
        },
      ])
    })

    it("filters non-matching categories and values", async ({ expect, db }) => {
      const nonMatchingCategory = {
        ...CATEGORY_NODE,
        id: "18399210-4ad5-41df-94b3-0f8fbf2c12c8",
        name: "foo",
      }
      await db.load({
        nodes: [CATEGORY_NODE, LABEL_NODE, VALUE_NODE, nonMatchingCategory],
      })

      const result = await db.nodes.match([CATEGORY_NODE.name])

      expect(result).toStrictEqual([
        {
          id: CATEGORY_NODE.id,
          name: CATEGORY_NODE.name,
          tally: CATEGORY_NODE.tally,
          children: null, // until I get rid of the limit patch
          // children: [
          //   {
          //     id: LABEL_NODE.id,
          //     name: LABEL_NODE.name,
          //     tally: LABEL_NODE.tally,
          //     children: null,
          //   },
          // ],
        },
      ])
    })

    it("ignores already-matched words", async ({ expect, db }) => {
      const categoryValue = {
        ...VALUE_NODE,
        id: "18399210-4ad5-41df-94b3-0f8fbf2c12c8",
        name: CATEGORY_NODE.name,
      }
      await db.load({
        nodes: [CATEGORY_NODE, LABEL_NODE, VALUE_NODE, categoryValue],
      })

      const result = await db.nodes.match([CATEGORY_NODE.name])

      expect(result).toStrictEqual([
        {
          id: CATEGORY_NODE.id,
          name: CATEGORY_NODE.name,
          tally: CATEGORY_NODE.tally,
          children: null, // until I get rid of the limit patch
          // children: [
          //   {
          //     id: LABEL_NODE.id,
          //     name: LABEL_NODE.name,
          //     tally: LABEL_NODE.tally,
          //     children: null,
          //   },
          // ],
        },
      ])
    })

    it("handles nodes without children", async ({ expect, db }) => {
      const categoryWithoutLabels = {
        ...CATEGORY_NODE,
        id: "2f311f14-b613-4a0d-ba84-5094d06cf3b6",
        name: "labeless-category",
      }
      const labelWithoutValues = {
        ...LABEL_NODE,
        id: "2b3a9822-a8bd-4b13-9393-6640ce7bade3",
        name: "valueless-label",
      }
      await db.load({
        nodes: [
          CATEGORY_NODE,
          LABEL_NODE,
          VALUE_NODE,
          categoryWithoutLabels,
          labelWithoutValues,
        ],
      })

      const result = await db.nodes.match([
        CATEGORY_NODE.name,
        categoryWithoutLabels.name,
      ])

      expect(result).toStrictEqual([
        {
          id: categoryWithoutLabels.id,
          name: categoryWithoutLabels.name,
          tally: categoryWithoutLabels.tally,
          children: null,
        },
        {
          id: CATEGORY_NODE.id,
          name: CATEGORY_NODE.name,
          tally: CATEGORY_NODE.tally,
          children: null, // until I get rid of the limit patch
          // children: [
          //   {
          //     id: labelWithoutValues.id,
          //     name: labelWithoutValues.name,
          //     tally: labelWithoutValues.tally,
          //     children: null,
          //   },
          //   {
          //     id: LABEL_NODE.id,
          //     name: LABEL_NODE.name,
          //     tally: LABEL_NODE.tally,
          //     children: null,
          //   },
          // ],
        },
      ])
    })
  })

  describe("upsert", () => {
    beforeEach<Fixtures>(async ({ db }) => {
      await db.load({
        nodes: [CATEGORY_NODE],
      })
    })

    it("creates new if it doesn't already exists", async ({ expect, db }) => {
      const newNode = {
        id: "bd11bd26-ea86-48c4-935d-2176dc91bd56",
        parent: CATEGORY_NODE.id,
        name: "tela",
        tally: 1,
      }

      await db.nodes.upsert(newNode)
      const nodes = await db.nodes.getAll()

      expect(nodes).toStrictEqual([CATEGORY_NODE, newNode])
    })

    it("updates tally if it already exists", async ({ expect, db }) => {
      const { id } = await db.nodes.upsert({ ...CATEGORY_NODE, tally: 1 })
      const nodes = await db.nodes.getAll()
      expect(id).toStrictEqual(CATEGORY_NODE.id)
      expect(nodes).toStrictEqual([
        { ...CATEGORY_NODE, tally: CATEGORY_NODE.tally + 1 },
      ])
    })

    it("ignores different id", async ({ expect, db }) => {
      const { id } = await db.nodes.upsert({
        ...CATEGORY_NODE,
        id: "bd11bd26-ea86-48c4-935d-2176dc91bd57",
        tally: 1,
      })
      const nodes = await db.nodes.getAll()
      expect(id).toStrictEqual(CATEGORY_NODE.id)
      expect(nodes).toStrictEqual([
        { ...CATEGORY_NODE, tally: CATEGORY_NODE.tally + 1 },
      ])
    })
  })
  
  describe("asAttributes", () => {
    it("returns attributes for nodes id", async ({ expect, db }) => {
      await db.load({
        nodes: [CATEGORY_NODE, LABEL_NODE, VALUE_NODE],
      })

      const result = await db.nodes.asAttributes([CATEGORY_NODE.id, LABEL_NODE.id, VALUE_NODE.id])

      expect(result).toStrictEqual([
        {
          label: CATEGORY_NODE.name,
          id: LABEL_NODE.id,
          name: LABEL_NODE.name
        },
        {
          label: LABEL_NODE.name,
          id: VALUE_NODE.id,
          name: VALUE_NODE.name
        },
        {
          label: null,
          name: CATEGORY_NODE.name,
          id: CATEGORY_NODE.id,
        },
      ])
    })

    it("handles unknown ids", async ({ expect, db }) => {
      await db.load({ nodes: [CATEGORY_NODE] })

      const result = await db.nodes.asAttributes([VALUE_NODE.id])

      expect(result).toStrictEqual([])
    })
  })
})
