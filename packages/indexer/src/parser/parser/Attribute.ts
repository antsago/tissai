import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"
import Filler from "./Filler.js"
import Label from "./Label.js"

const any =
  <T>(check: (reader: TokenReader<Token>) => T) =>
  (reader: TokenReader<Token>) => {
    const results = []

    while (reader.hasNext()) {
      const result = check(reader)

      if (!result) {
        break
      }

      results.push(result)
    }

    return results
  }

// AttributeL -> LabelL (Filler* LabelL)*
const Attribute = (reader: TokenReader<Token>) => {
  const label = Label(reader)

  if (!label) {
    return null
  }

  let values = [label]
  while (reader.hasNext()) {
    reader.savePosition()

    const filler = any(Filler)(reader)
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
