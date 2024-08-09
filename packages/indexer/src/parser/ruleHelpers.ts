import type TokenReader from "./TokenReader.js"

export const minOf =
  <T, Token>(minAmount: number, check: (reader: TokenReader<Token>) => T) =>
  (reader: TokenReader<Token>) => {
    reader.savePosition()

    const results = []

    while (true) {
      const result = check(reader)

      if (!result) {
        if (results.length < minAmount) {
          reader.restoreSave()
          return null
        }

        break
      }

      results.push(result)
    }

    reader.discardSave()
    return results
  }

