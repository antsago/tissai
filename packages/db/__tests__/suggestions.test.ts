import { describe, test, beforeEach } from "vitest"
import { dbFixture } from "#mocks"
import { CATEGORY_LABEL } from "../src"

type Fixtures = { db: dbFixture }
const it = test.extend<Fixtures>({
  db: dbFixture,
})

describe.concurrent("suggestions", () => {
  describe("category", () => {
    const SCHEMA = {
      category: "category",
      label: CATEGORY_LABEL,
      value: "value",
      tally: 2,
    }

    beforeEach<Fixtures>(async ({ db }) => {
      await db.load({ schemas: [SCHEMA] })
    })

    it("suggests most likely categories", async ({ expect, db }) => {
      const otherCategory = "category2"
      await db.load({
        schemas: [
          {
            category: otherCategory,
            label: CATEGORY_LABEL,
            value: SCHEMA.value,
            tally: 4,
          },
        ],
      })

      const suggestions = await db.suggestions.category()

      expect(suggestions).toStrictEqual({
        label: CATEGORY_LABEL,
        values: [otherCategory, SCHEMA.category],
      })
    })

    it("ignores non-category counts", async ({ expect, db }) => {
      const otherCategory = "category2"
      await db.load({
        schemas: [
          {
            category: otherCategory,
            label: CATEGORY_LABEL,
            value: SCHEMA.value,
            tally: 4,
          },
          {
            ...SCHEMA,
            label: "non-category-label",
            tally: 4,
          },
        ],
      })

      const suggestions = await db.suggestions.category()

      expect(suggestions).toStrictEqual({
        label: CATEGORY_LABEL,
        values: [otherCategory, SCHEMA.category],
      })
    })

    it("limits suggested values", async ({ expect, db }) => {
      const limit = 5
      await db.load({
        schemas: new Array(limit + 1).fill(null).map((_, i) => ({
          category: `${SCHEMA.category}${i}`,
          label: CATEGORY_LABEL,
          value: SCHEMA.value,
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
