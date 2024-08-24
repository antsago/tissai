import type { TokenReader } from "../TokenReader.js"
import type { WordToken } from "../types.js"

const Word =
  (check: (word: WordToken) => boolean) => (reader: TokenReader<WordToken>) => {
    const word = reader.get()
    if (word && check(word)) {
      reader.next()
      return word
    }

    return null
  }

export default Word
