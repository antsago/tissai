import _ from "lodash"
import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"
import Filler from "./Filler.js"
import Label from "./Label.js"

const any =
  <T>(check: (reader: TokenReader<Token>) => T) =>
  (reader: TokenReader<Token>) => {
    const results = []

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

// AttributeL -> LabelL (Filler* LabelL)*
const Attribute = (reader: TokenReader<Token>) => {
  const label = Label()(reader)

  if (!label) {
    return null
  }

  let values = [label]
  let types = label.labels
  while (reader.hasNext()) {
    reader.savePosition()

    const filler = any(Filler)(reader)
    const nextLabel = Label(types)(reader)

    if (!nextLabel) {
      reader.restoreSave()
      break
    }

    values = [...values, ...filler, nextLabel]
    types = _.intersection(types, nextLabel.labels)
    reader.discardSave()
  }

  return {
    type: "attribute",
    labels: types,
    value: values.flat(Infinity),
  }
}

export default Attribute
