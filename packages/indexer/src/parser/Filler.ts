import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"

const Filler = (reader: TokenReader<Token>) => {
  const nextToken = reader.get()
  if (!nextToken.isMeaningful) {
    reader.next()
    return nextToken
  }

  return null
}

export default Filler
