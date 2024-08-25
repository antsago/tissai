import type { EntityToken, DataToken } from "../types.js"
import { Token, restructure } from "../operators/index.js"
import { ValueSeparator, Id } from "./symbols.js"

export const IsData = (data?: DataToken) =>
  Token(
    (token: EntityToken) =>
      typeof token !== "symbol" && (data === undefined || token === data),
  )

export const IsSymbol = (symbol: symbol) =>
  Token((token: EntityToken) => token === symbol)

export const IsValue = Token(
  (token: EntityToken) =>
    token === Id || token === ValueSeparator || typeof token !== "symbol",
)

export const IsParsed = <Output>(parse: (text: string) => Output) =>
  restructure(IsData(), async (token) => {
    const parsed = await parse(token as string)
    return { token, parsed }
  })
