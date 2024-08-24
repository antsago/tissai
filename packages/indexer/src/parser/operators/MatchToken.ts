import { type Token, type TokenReader } from "../TokenReader.js"

const MatchToken =
  (check: (nextToken: Token) => boolean) => (reader: TokenReader<Token>) => {
    const nextToken = reader.get()
    if (nextToken && check(nextToken)) {
      reader.next()
      return nextToken
    }

    return null
  }

export default MatchToken
