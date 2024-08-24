import type { TokenReader } from "../TokenReader.js"
import type { EntityToken } from "../types.js"

export const IsString = (token?: string) => (reader: TokenReader<EntityToken>) => {
  const nextToken = reader.get()
  if (nextToken && typeof nextToken !== 'symbol' && (token === undefined || nextToken === token)) {
    reader.next()
    return nextToken
  }

  return null
}
