import type { TokenReader } from "../TokenReader.js"

export const Token =
  <T>(check: (token: T) => boolean) => (reader: TokenReader<T>) => {
    const token = reader.get()
    if (token && check(token)) {
      reader.next()
      return token
    }

    return null
  }
