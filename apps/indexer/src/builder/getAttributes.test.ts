import { expect, describe, it } from "vitest"
import { Tokenizer } from "@tissai/tokenizer"
import { getAttributes } from "./getAttributes"

describe("getAttributes", () => {
  it("returns normalized words", async () => {
    const title = "adidas Logo Joggers Junior"

    const result = await getAttributes(title, Tokenizer())

    expect(result).toStrictEqual([
      "adidas",
      "logo",
      "joggers",
      "junior",
    ])
  })
  
  it("removes meaningless words", async () => {
    const title = "air jordan titan pantalon - mujer"

    const result = await getAttributes(title, Tokenizer())

    expect(result).toStrictEqual([
      "air",
      "jordan",
      "titan",
      "pantalon",
      "mujer",
    ])
  })
})
