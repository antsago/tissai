import type TokenReader from "./tokenReader.js"

export const minOf =
  <T>(minAmount: number, check: (reader: TokenReader) => T) =>
  (reader: TokenReader) => {
    reader.pushState()

    const results = []

    while (true) {
      const result = check(reader)

      if (!result) {
        if (results.length < minAmount) {
          reader.restoreState()
          return null
        }

        break
      }

      results.push(result)
    }

    reader.popState()
    return results
  }

export const token = (type: string) => (reader: TokenReader) => {
  if (reader.isLabel(type)) {
    const result = reader.get()

    reader.next()

    return result
  }

  return null
}
