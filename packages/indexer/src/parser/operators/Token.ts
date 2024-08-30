import type { TokenReader } from "../TokenReader.js"
import { NonMatch } from "./nonMatch.js"

export const Token =
  <T>(check: (token: T) => boolean) =>
  (reader: TokenReader<T>) => {
    const token = reader.get()
    if (token !== undefined && check(token)) {
      reader.next()
      return token
    }

    return NonMatch
  }
