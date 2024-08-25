import type { EntityToken } from "../types.js"
import { Token, restructure } from "../operators/index.js"
import { ValueSeparator, Id } from "./symbols.js"

export const IsString = (text?: string) =>
  Token(
    (token: EntityToken) =>
      typeof token !== "symbol" && (text === undefined || token === text),
  )

export const IsSymbol = (symbol: symbol) =>
  Token((token: EntityToken) => token === symbol)

export const IsValue = Token(
  (token: EntityToken) =>
    token === Id || token === ValueSeparator || typeof token === "string",
)

export const IsParsed = <Output>(parse: (text: string) => Output) =>
  restructure(IsString(), async (token) => {
    const parsed = await parse(token as string)
    return { token, parsed }
  })
