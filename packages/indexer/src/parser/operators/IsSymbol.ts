import type { TokenReader } from "../TokenReader.js"
import type { EntityToken } from "../types.js"

export const IsSymbol = (symbol: symbol) => (reader: TokenReader<EntityToken>) => {
  const nextToken = reader.get()
  if (nextToken && nextToken === symbol) {
    reader.next()
    return nextToken
  }

  return null
}
