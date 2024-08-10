import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"
import Filler from "./Filler.js"
import Label from "./Label.js"

const minOf =
  <T>(minAmount: number, check: (reader: TokenReader<Token>) => T) =>
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

// AttributeL -> LabelL (Filler* LabelL)*
const Attribute = (reader: TokenReader<Token>) => {
  const label = Label(reader)

  if (!label) {
    return
  }

  let values = [label]
  while (true) {
    reader.savePosition()
    const filler = minOf(0, Filler)(reader) ?? []
    const nextLabel = Label(reader, label.labels)

    if (!nextLabel) {
      reader.restoreSave()
      break
    }

    values = [...values, ...filler, nextLabel]
    reader.discardSave()
  }

  return {
    type: "attribute",
    labels: label.labels,
    value: values.flat(Infinity),
  }
}

export default Attribute
