import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { Token } from "./Token.js"
import { NonMatch } from "./nonMatch.js"
import { restructure } from "./restructure.js"

describe("restructure", () => {
  const transform = (text: string) => `${text} transformed`
  const IsYes = Token((t: string) => t === "yes")

  it("transforms output", async () => {
    const reader = TokenReader(["yes"])

    const result = await restructure(IsYes, transform)(reader)

    expect(result).toStrictEqual("yes transformed")
  })

  it("does not transform non-matches", async () => {
    const reader = TokenReader(["no"])

    const result = await restructure(IsYes, transform)(reader)

    expect(result).toStrictEqual(NonMatch)
  })
})
