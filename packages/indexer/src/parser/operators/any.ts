import { type Token, type TokenReader } from "../TokenReader.js"
import { type Rule } from "./Rule.js"

const any =
  <T>(check: Rule<T>) =>
  (reader: TokenReader<Token>) => {
    const results = [] as NonNullable<T>[]

    while (reader.hasNext()) {
      reader.savePosition()

      const result = check(reader)
      if (!result) {
        reader.restoreSave()
        break
      }

      results.push(result)
      reader.discardSave()
    }

    return results
  }

export default any
