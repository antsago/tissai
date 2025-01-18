import { expect, describe, it } from "vitest"
import { addSchema } from "./addSchema"

describe("addSchema", () => {
  it("adds first schema as-is", () => {
    const schemas = {}
    const schema = { category: "pantalón", attributes: ["adidas", "logo", "joggers", "junior"]}

    const result = addSchema(schema, schemas)

    expect(result).toStrictEqual({
      "pantalón": {
        "adidas": 1,
        "logo": 1,
        "joggers": 1,
        "junior": 1,
      }
    })
  })

  it("adds new categories as-is", () => {
    const schemas = {
      "foobar": {
        "bar": 1,
        "foo": 1,
      }
    }
    const schema = { category: "pantalón", attributes: ["adidas", "logo", "joggers", "junior"]}

    const result = addSchema(schema, schemas)

    expect(result).toStrictEqual({
      ...schemas,
      "pantalón": {
        "adidas": 1,
        "logo": 1,
        "joggers": 1,
        "junior": 1,
      }
    })
  })

  it("increases count for existing categories", () => {
    const schemas = {
      "pantalón": {
        "adidas": 2,
        "foo": 1,
      }
    }
    const schema = { category: "pantalón", attributes: ["adidas", "logo"]}

    const result = addSchema(schema, schemas)

    expect(result).toStrictEqual({
      "pantalón": {
        "adidas": 3,
        "logo": 1,
        "foo": 1,
      }
    })
  })
})
