import { expect, describe, it } from "vitest"
import { addSchema } from "./addSchema"

describe("addSchema", () => {
  it("adds first schema as-is", () => {
    const schemas = {}
    const schema = {
      category: "pantalón",
      categoryWord: "pantalon",
      attributes: ["adidas", "logo", "junior"],
    }

    const result = addSchema(schema, schemas)

    expect(result).toStrictEqual({
      pantalón: {
        attributes: {
          adidas: 1,
          logo: 1,
          junior: 1,
        },
        labels: {
          pantalon: 1,
        },
      },
    })
  })

  it("adds new categories as-is", () => {
    const schemas = {
      foobar: {
        attributes: {
          bar: 1,
          foo: 1,
        },
        labels: {
          foobar: 1,
        },
      },
    }
    const schema = {
      category: "pantalón",
      categoryWord: "pantalon",
      attributes: ["adidas", "logo", "junior"],
    }

    const result = addSchema(schema, schemas)

    expect(result).toStrictEqual({
      ...schemas,
      pantalón: {
        attributes: {
          adidas: 1,
          logo: 1,
          junior: 1,
        },
        labels: {
          pantalon: 1,
        },
      },
    })
  })

  it("increases count for existing categories", () => {
    const schemas = {
      pantalón: {
        attributes: {
          adidas: 2,
          foo: 1,
        },
        labels: {
          pantalon: 1,
          bar: 1,
        },
      },
    }
    const schema = {
      category: "pantalón",
      categoryWord: "pantalon",
      attributes: ["adidas", "logo"],
    }

    const result = addSchema(schema, schemas)

    expect(result).toStrictEqual({
      pantalón: {
        attributes: {
          adidas: 3,
          logo: 1,
          foo: 1,
        },
        labels: {
          pantalon: 2,
          bar: 1,
        },
      },
    })
  })
})
