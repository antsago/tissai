import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"
import { minOf } from "./ruleHelpers.js"
import Filler from "./Filler.js"
import Label from "./Label.js"

// ProductPart -> Attribute | Filler
const ProductPart = <T extends Token>(reader: TokenReader<T>) => {
  return Attribute(reader) ?? Filler(reader)
}

// AttributeL -> LabelL (Filler* LabelL)*
const Attribute = <T extends Token>(reader: TokenReader<T>) => {
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

export default ProductPart
