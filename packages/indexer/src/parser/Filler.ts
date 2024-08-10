import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"

const Filler = (reader: TokenReader<Token>) => {
  const nextToken = reader.get()
  if (!nextToken || nextToken.isMeaningful) {
    return null
  }
  
  reader.next()
  return nextToken
}

export default Filler
