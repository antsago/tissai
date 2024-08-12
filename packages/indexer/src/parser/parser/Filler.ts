import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"

export const MatchToken = (check: (nextToken: Token|undefined) => boolean) => (reader: TokenReader<Token>) => {
  const nextToken = reader.get()
  if (check(nextToken)) {
    reader.next()
    return nextToken
  }
  
  return null
}

const Filler = MatchToken((nextToken) => !!nextToken && !nextToken.isMeaningful)

export default Filler
