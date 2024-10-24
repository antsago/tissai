import { randomUUID } from "node:crypto"
import { describe, test, beforeEach } from "vitest"
import { CATEGORY_NODE, LABEL_NODE, VALUE_NODE, dbFixture } from "#mocks"
import { CATEGORY_LABEL } from "../src"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("suggestions", () => {
  beforeEach<Fixtures>(async ({ db }) => {
    await db.load({ nodes: [CATEGORY_NODE, LABEL_NODE, VALUE_NODE] })
  })

  describe("category", () => {
    it("suggests most likely categories", async ({ expect, db }) => {
      const otherCategory = {
        id: "d05f70aa-7629-4be3-ae54-3c8c8070251e",
        parent: null,
        name: "category 2",
        tally: CATEGORY_NODE.tally + 2,
      }

      await db.load({
        nodes: [otherCategory],
      })

      const suggestions = await db.suggestions.category()

      expect(suggestions).toStrictEqual({
        label: CATEGORY_LABEL,
        values: [
          {
            id: otherCategory.id,
            name: otherCategory.name,
          },
          {
            id: CATEGORY_NODE.id,
            name: CATEGORY_NODE.name,
          },
        ],
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
    const otherLabel = {
      id: "3f1cdb67-10f2-433a-8c60-6fbe337fa62d",
      parent: CATEGORY_NODE.id,
      name: "label2",
      tally: LABEL_NODE.tally + 2,
    }
    const otherValue = {
      id: "1c3b32bc-f3db-4045-acf6-e26b475c8ee4",
      parent: otherLabel.id,
      name: "value2",
      tally: VALUE_NODE.tally,
    }

    it("suggests most likely labels", async ({ expect, db }) => {
      await db.load({
        nodes: [otherLabel, otherValue],
      })

      const suggestions = await db.suggestions.attributes(CATEGORY_NODE.id)

      expect(suggestions).toStrictEqual([
        {
          label: otherLabel.name,
          values: [{ id: otherValue.id, name: otherValue.name }],
        },
        {
          label: LABEL_NODE.name,
          values: [{ id: VALUE_NODE.id, name: VALUE_NODE.name }],
        },
      ])
    })

    it("ignores other categories", async ({ expect, db }) => {
      const otherCategory = "0ed06e9b-822b-4f94-8cf4-f3d06cb27a44"
      await db.load({
        nodes: [
          {
            id: otherCategory,
            parent: null,
            name: "category2",
            tally: 5,
          },
          {
            ...otherLabel,
            parent: otherCategory,
          },
          otherValue,
        ],
      })

      const suggestions = await db.suggestions.attributes(CATEGORY_NODE.id)

      expect(suggestions).toStrictEqual([
        {
          label: LABEL_NODE.name,
          values: [{ id: VALUE_NODE.id, name: VALUE_NODE.name }],
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
            ...otherValue,
            parent: LABEL_NODE.id,
            tally: VALUE_NODE.tally + 2,
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(CATEGORY_NODE.id)

      expect(suggestions).toStrictEqual([
        {
          label: LABEL_NODE.name,
          values: [
            { id: otherValue.id, name: otherValue.name },
            { id: VALUE_NODE.id, name: VALUE_NODE.name },
          ],
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
