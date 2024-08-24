import { TokenReader, type EntityToken } from "../TokenReader.js"

export const IsSymbol = (symbol: symbol) => (reader: TokenReader<EntityToken>) => {
  const nextToken = reader.get()
  if (nextToken && nextToken === symbol) {
    reader.next()
    return nextToken
  }

  return null
}
