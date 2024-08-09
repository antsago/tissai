import type TokenReader from "./tokenReader.js"

export const minOf =
  <T>(minAmount: number, check: (reader: TokenReader) => T) =>
  (reader: TokenReader) => {
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

export const token = (type: string) => (reader: TokenReader) => {
  if (reader.hasLabel([type])) {
    const result = reader.get()

    reader.next()

    return result
  }

  return null
}
