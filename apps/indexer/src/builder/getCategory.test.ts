import { expect, describe, it } from "vitest"
import { getCategory } from "./getCategory"

describe("getCategory", () => {
  it("returns llm-generated category", { timeout: 60000 }, async () => {
    const title = "adidas Logo Joggers Junior"

    const result = await getCategory(title)

    expect(result).toStrictEqual("pantalón")
  })
})
