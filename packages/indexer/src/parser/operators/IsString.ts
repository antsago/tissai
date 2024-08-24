import { TokenReader, type EntityToken } from "../TokenReader.js"

export const IsString = (token?: string) => (reader: TokenReader<EntityToken>) => {
  const nextToken = reader.get()
  if (nextToken && typeof nextToken !== 'symbol' && (token === undefined || nextToken === token)) {
    reader.next()
    return nextToken
  }

  return null
}
