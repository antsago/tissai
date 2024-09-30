import { describe, test, beforeEach } from "vitest"
import { CATEGORY_NODE, dbFixture } from "#mocks"
import { CATEGORY_LABEL } from "../src"
import { randomUUID } from "crypto"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("suggestions", () => {
  describe("category", () => {
    beforeEach<Fixtures>(async ({ db }) => {
      await db.load({ nodes: [CATEGORY_NODE] })
    })

    it("suggests most likely categories", async ({ expect, db }) => {
      const otherCategory = "category 2"

      await db.load({
        nodes: [{
          id: "d05f70aa-7629-4be3-ae54-3c8c8070251e",
          parent: null,
          name: otherCategory,
          tally: CATEGORY_NODE.tally + 2, 
        }, {
          id: "89c472de-d6a3-4c3a-8b9a-c827820b6f91",
          parent: CATEGORY_NODE.id,
          name: "a label",
          tally: 5,
        }],
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
    const SCHEMA = {
      category: "category",
      label: "label",
      value: "value",
      tally: 2,
    }

    beforeEach<Fixtures>(async ({ db }) => {
      await db.load({ schemas: [SCHEMA] })
    })

    it("suggests most likely labels", async ({ expect, db }) => {
      const otherLabel = "label2"
      await db.load({
        schemas: [
          {
            category: SCHEMA.category,
            label: otherLabel,
            value: SCHEMA.value,
            tally: 4,
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(SCHEMA.category)

      expect(suggestions).toStrictEqual([
        {
          label: otherLabel,
          values: [SCHEMA.value],
        },
        {
          label: SCHEMA.label,
          values: [SCHEMA.value],
        },
      ])
    })

    it("ignores other categories", async ({ expect, db }) => {
      const otherCategory = "category2"
      const otherLabel = "label2"
      await db.load({
        schemas: [
          {
            category: SCHEMA.category,
            label: otherLabel,
            value: SCHEMA.value,
            tally: 3,
          },
          {
            ...SCHEMA,
            category: otherCategory,
          },
          {
            ...SCHEMA,
            category: otherCategory,
            label: "label3",
          },
          {
            ...SCHEMA,
            category: otherCategory,
            value: "value2",
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(SCHEMA.category)

      expect(suggestions).toStrictEqual([
        {
          label: otherLabel,
          values: [SCHEMA.value],
        },
        {
          label: SCHEMA.label,
          values: [SCHEMA.value],
        },
      ])
    })

    it("ignores category label", async ({ expect, db }) => {
      await db.load({
        schemas: [
          {
            category: SCHEMA.category,
            label: CATEGORY_LABEL,
            value: SCHEMA.value,
            tally: 4,
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(SCHEMA.category)

      expect(suggestions).toStrictEqual([
        {
          label: SCHEMA.label,
          values: [SCHEMA.value],
        },
      ])
    })

    it("limits number of suggestions", async ({ expect, db }) => {
      const limit = 3
      await db.load({
        schemas: new Array(limit + 1).fill(null).map((_, i) => ({
          category: SCHEMA.category,
          label: `${SCHEMA.label}_${i}`,
          value: SCHEMA.value,
          tally: 4,
        })),
      })

      const suggestions = await db.suggestions.attributes(
        SCHEMA.category,
        limit,
      )

      expect(suggestions.length).toStrictEqual(limit)
    })

    it("returns most likely values", async ({ expect, db }) => {
      const otherValue = "value1"
      await db.load({
        schemas: [
          {
            ...SCHEMA,
            value: otherValue,
            tally: 4,
          },
        ],
      })

      const suggestions = await db.suggestions.attributes(SCHEMA.category)

      expect(suggestions).toStrictEqual([
        {
          label: SCHEMA.label,
          values: [otherValue, SCHEMA.value],
        },
      ])
    })

    it("limits suggested values", async ({ expect, db }) => {
      const limit = 5
      await db.load({
        schemas: new Array(limit + 1).fill(null).map((_, i) => ({
          ...SCHEMA,
          value: `${SCHEMA.value}${i}`,
        })),
      })

      const suggestions = await db.suggestions.attributes(
        SCHEMA.category,
        undefined,
        limit,
      )

      expect(suggestions[0].values.length).toStrictEqual(limit)
    })
  })
})
