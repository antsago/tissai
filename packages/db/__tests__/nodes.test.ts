import { describe, test, beforeEach } from "vitest"
import { dbFixture, CATEGORY_NODE, LABEL_NODE, VALUE_NODE } from "#mocks"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("nodes", () => {
  describe("inference", () => {
    it("returns interpretations", async ({ expect, db }) => {
      await db.load({
        nodes: [CATEGORY_NODE, LABEL_NODE, VALUE_NODE],
      })

      const result = await db.nodes.infer([CATEGORY_NODE.name, VALUE_NODE.name])

      expect(result).toStrictEqual([
        {
          id: CATEGORY_NODE.id,
          probability:
            CATEGORY_NODE.tally * (VALUE_NODE.tally / CATEGORY_NODE.tally),
          properties: [VALUE_NODE.id],
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

      const result = await db.nodes.infer([CATEGORY_NODE.name])

      expect(result).toStrictEqual([
        {
          id: CATEGORY_NODE.id,
          probability:
            CATEGORY_NODE.tally *
            ((CATEGORY_NODE.tally - LABEL_NODE.tally) / CATEGORY_NODE.tally),
          properties: null,
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

      const result = await db.nodes.infer([CATEGORY_NODE.name])

      expect(result).toStrictEqual([
        {
          id: CATEGORY_NODE.id,
          probability:
            CATEGORY_NODE.tally *
            ((CATEGORY_NODE.tally - LABEL_NODE.tally) / CATEGORY_NODE.tally),
          properties: null,
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

      const result = await db.nodes.infer([
        CATEGORY_NODE.name,
        categoryWithoutLabels.name,
      ])

      expect(result).toStrictEqual([
        {
          id: categoryWithoutLabels.id,
          probability: categoryWithoutLabels.tally,
          properties: null,
        },
        {
          id: CATEGORY_NODE.id,
          probability:
            CATEGORY_NODE.tally *
            ((CATEGORY_NODE.tally - LABEL_NODE.tally) / CATEGORY_NODE.tally) *
            ((CATEGORY_NODE.tally - labelWithoutValues.tally) /
              CATEGORY_NODE.tally),
          properties: null,
        },
      ])
    })

    it("prefers most-matching interpretations", async ({ expect, db }) => {
      const probableCategory = {
        ...CATEGORY_NODE,
        id: "36c65865-58b2-49ef-b1ae-6b09a9ab60f1",
        name: "common-category",
        tally: CATEGORY_NODE.tally + 2,
      }
      const probableValue = {
        ...VALUE_NODE,
        id: "2b3a9822-a8bd-4b13-9393-6640ce7bade3",
        name: "likely-value",
        tally: VALUE_NODE.tally + 2,
      }
      await db.load({
        nodes: [
          CATEGORY_NODE,
          LABEL_NODE,
          VALUE_NODE,
          probableCategory,
          probableValue,
        ],
      })

      const result = await db.nodes.infer([
        CATEGORY_NODE.name,
        VALUE_NODE.name,
        probableCategory.name,
      ])

      expect(result).toStrictEqual([
        {
          id: CATEGORY_NODE.id,
          probability:
            CATEGORY_NODE.tally * (VALUE_NODE.tally / CATEGORY_NODE.tally),
          properties: [VALUE_NODE.id],
        },
        {
          id: probableCategory.id,
          probability: probableCategory.tally,
          properties: null,
        },
      ])
    })

    it("prefers most-likely interpretations", async ({ expect, db }) => {
      const probableValue = {
        ...VALUE_NODE,
        id: "2b3a9822-a8bd-4b13-9393-6640ce7bade3",
        name: "likely-value",
        tally: VALUE_NODE.tally + 2,
      }
      const probableCategory = {
        ...CATEGORY_NODE,
        id: "36c65865-58b2-49ef-b1ae-6b09a9ab60f1",
        name: "common-category",
        tally: CATEGORY_NODE.tally + 2,
      }
      const otherLabel = {
        parent: probableCategory.id,
        name: "other-label",
        id: "2f311f14-b613-4a0d-ba84-5094d06cf3b6",
        tally: LABEL_NODE.tally,
      }
      const otherValue = {
        parent: otherLabel.id,
        name: "other-value",
        id: "18399210-4ad5-41df-94b3-0f8fbf2c12c8",
        tally: probableValue.tally - 1,
      }
      await db.load({
        nodes: [
          CATEGORY_NODE,
          LABEL_NODE,
          VALUE_NODE,
          probableValue,
          probableCategory,
          otherLabel,
          otherValue,
        ],
      })

      const result = await db.nodes.infer([
        CATEGORY_NODE.name,
        VALUE_NODE.name,
        probableCategory.name,
        probableValue.name,
        otherValue.name,
      ])

      expect(result).toStrictEqual([
        {
          id: CATEGORY_NODE.id,
          probability:
            CATEGORY_NODE.tally * (probableValue.tally / CATEGORY_NODE.tally),
          properties: [probableValue.id],
        },
        {
          id: probableCategory.id,
          probability:
            probableCategory.tally *
            (otherValue.tally / probableCategory.tally),
          properties: [otherValue.id],
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
})
