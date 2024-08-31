import { expect, describe, it } from "vitest"
import { TokenReader } from "../TokenReader.js"
import { Token } from "./Token.js"
import any from "./any.js"

describe("any", () => {
  const anyTrue = (tokens: boolean[]) => any(Token((t: boolean) => t))(TokenReader(tokens))

  it("accepts no matches", async () => {
    const tokens = [false]
    const result = await anyTrue(tokens)
    expect(result).toStrictEqual([])
  })

  it("accepts single match", async () => {
    const tokens = [true, false]
    const result = await anyTrue(tokens)
    expect(result).toStrictEqual([true])
  })

  it("accepts multiple matches", async () => {
    const tokens = [true, true, false]
    const result = await anyTrue(tokens)
    expect(result).toStrictEqual([true, true])
  })
})
