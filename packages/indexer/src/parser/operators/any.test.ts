import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { Token } from "./Token.js"
import rawAny from "./any.js"

describe("any", () => {
  const any = (tokens: boolean[]) => rawAny(Token((t: boolean) => t))(TokenReader(tokens))

  it("accepts no matches", async () => {
    const tokens = [false]
    const result = await any(tokens)
    expect(result).toStrictEqual([])
  })

  it("accepts single match", async () => {
    const tokens = [true, false]
    const result = await any(tokens)
    expect(result).toStrictEqual([true])
  })

  it("accepts multiple matches", async () => {
    const tokens = [true, true, false]
    const result = await any(tokens)
    expect(result).toStrictEqual([true, true])
  })
})
