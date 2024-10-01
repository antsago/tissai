import { describe, test, beforeEach } from "vitest"
import { CATEGORY_NODE, dbFixture } from "#mocks"
import { CATEGORY_LABEL } from "../src"
import { randomUUID } from "crypto"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("suggestions", () => {
  const LABEL_NODE = {
    id: "89c472de-d6a3-4c3a-8b9a-c827820b6f91",
    parent: CATEGORY_NODE.id,
    name: "a label",
    tally: 5,
  }
  const VALUE_NODE = {
    id: "761384ca-6756-49ff-bcb4-8a9a94e3ea8a",
    parent: LABEL_NODE.id,
    name: "a value",
    tally: 5,
  }

  beforeEach<Fixtures>(async ({ db }) => {
    await db.load({ nodes: [CATEGORY_NODE, LABEL_NODE, VALUE_NODE] })
  })

  describe("category", () => {
    it("suggests most likely categories", async ({ expect, db }) => {
      const otherCategory = "category 2"

      await db.load({
        nodes: [
          {
            id: "d05f70aa-7629-4be3-ae54-3c8c8070251e",
            parent: null,
            name: otherCategory,
            tally: CATEGORY_NODE.tally + 2,
          },
        ],
      })

      const suggestions = await db.suggestions.category()

      expect(suggestions).toStrictEqual({
        label: CATEGORY_LABEL,
        values: [otherCategory, CATEGORY_NODE.name],
      })
    })

    it("limits suggested values", async ({ expect, db }) => {
      const limit = 5
      await db.load({
        nodes: new Array(limit + 1).fill(null).map((_, i) => ({
          id: randomUUID(),
          parent: null,
          name: `${CATEGORY_NODE.name}${i}`,
          tally: 4,
        })),
      })

      const suggestions = await db.suggestions.category(limit)

      expect(suggestions.values.length).toStrictEqual(limit)
    })
  })

  describe("atttributes", () => {
    const otherCategory = "category2"
    const otherLabel = "label2"
    const otherValue = "value2"

    it("suggests most likely labels", async ({ expect, db }) => {
      await db.load({
        nodes: [
          {
            id: "3f1cdb67-10f2-433a-8c60-6fbe337fa62d",
            parent: CATEGORY_NODE.id,
            name: otherLabel,
            tally: LABEL_NODE.tally + 2,
          },
          {
            id: "1c3b32bc-f3db-4045-acf6-e26b475c8ee4",
            parent: "3f1cdb67-10f2-433a-8c60-6fbe337fa62d",
            name: otherValue,
            tally: VALUE_NODE.tally,
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(CATEGORY_NODE.id)

      expect(suggestions).toStrictEqual([
        {
          label: otherLabel,
          values: [otherValue],
        },
        {
          label: LABEL_NODE.name,
          values: [VALUE_NODE.name],
        },
      ])
    })

    it("ignores other categories", async ({ expect, db }) => {
      await db.load({
        nodes: [
          {
            id: "0ed06e9b-822b-4f94-8cf4-f3d06cb27a44",
            parent: null,
            name: otherCategory,
            tally: 5,
          },
          {
            id: "3f1cdb67-10f2-433a-8c60-6fbe337fa62d",
            parent: "0ed06e9b-822b-4f94-8cf4-f3d06cb27a44",
            name: otherLabel,
            tally: 5,
          },
          {
            id: "1c3b32bc-f3db-4045-acf6-e26b475c8ee4",
            parent: "3f1cdb67-10f2-433a-8c60-6fbe337fa62d",
            name: otherValue,
            tally: 5,
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(CATEGORY_NODE.id)

      expect(suggestions).toStrictEqual([
        {
          label: LABEL_NODE.name,
          values: [VALUE_NODE.name],
        },
      ])
    })

    it("limits number of suggestions", async ({ expect, db }) => {
      const limit = 3
      await db.load({
        nodes: new Array(limit + 1).fill(null).map((_, i) => ({
          id: randomUUID(),
          name: `${LABEL_NODE.name}_${i}`,
          parent: CATEGORY_NODE.id,
          tally: 4,
        })),
      })

      const suggestions = await db.suggestions.attributes(
        CATEGORY_NODE.id,
        limit,
      )

      expect(suggestions.length).toStrictEqual(limit)
    })

    it("returns most likely values", async ({ expect, db }) => {
      await db.load({
        nodes: [
          {
            id: "1c3b32bc-f3db-4045-acf6-e26b475c8ee4",
            parent: LABEL_NODE.id,
            name: otherValue,
            tally: VALUE_NODE.tally + 2,
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(CATEGORY_NODE.id)

      expect(suggestions).toStrictEqual([
        {
          label: LABEL_NODE.name,
          values: [otherValue, VALUE_NODE.name],
        },
      ])
    })

    it("limits suggested values", async ({ expect, db }) => {
      const limit = 5
      await db.load({
        nodes: new Array(limit + 1).fill(null).map((_, i) => ({
          id: randomUUID(),
          parent: LABEL_NODE.id,
          name: `${VALUE_NODE.name}${i}`,
          tally: 4,
        })),
      })

      const suggestions = await db.suggestions.attributes(
        CATEGORY_NODE.id,
        undefined,
        limit,
      )

      expect(suggestions[0].values.length).toStrictEqual(limit)
    })
  })
})
