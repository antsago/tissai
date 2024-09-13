import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { Token } from "./Token.js"
import rawAny from "./any.js"

describe("any", () => {
  const any = rawAny(Token((text: string) => text === "yes"))

  it("accepts no matches", async () => {
    const reader = TokenReader(["no"])

    const result = await any(reader)

    expect(result).toStrictEqual([])
    expect(reader.get()).toStrictEqual("no")
  })

  it("accepts single match", async () => {
    const reader = TokenReader(["yes", "no"])

    const result = await any(reader)

    expect(result).toStrictEqual(["yes"])
    expect(reader.get()).toStrictEqual("no")
  })

  it("accepts multiple matches", async () => {
    const reader = TokenReader(["yes", "yes", "no"])

    const result = await any(reader)

    expect(result).toStrictEqual(["yes", "yes"])
    expect(reader.get()).toStrictEqual("no")
  })
})
