import { ValueSeparator, Id } from "@tissai/tokenizer"
import type { EntityToken, DataToken } from "../../types.js"
import { Token } from "../../operators/index.js"

export const Any = Token<EntityToken>(() => true)

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
