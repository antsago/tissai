import type { EntityToken } from "../types.js"
import { Token } from "../operators/index.js"
import { ValueSeparator, Id } from "./symbols.js"

export const IsString = (text?: string) =>
  Token(
    (token: EntityToken) =>
      typeof token !== "symbol" && (text === undefined || token === text),
  )

export const IsSymbol = (symbol: symbol) =>
  Token((token: EntityToken) => token === symbol)

export const IsAny = Token(
  (token: EntityToken) =>
    token === Id || token === ValueSeparator || typeof token === "string",
)
