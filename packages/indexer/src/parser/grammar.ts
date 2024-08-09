import type TokenReader from "./tokenReader.js"
import { minOf, token } from "./ruleHelpers.js"

// ProductPart -> Attribute | Filler
const ProductPart = (reader: TokenReader) => {
  return Attribute(reader) ?? Filler(reader)
}

// AttributeL -> LabelL (Filler* LabelL)*
const Attribute = (reader: TokenReader) => {
  const label = Label(reader)

  if (!label) {
    return
  }

  let values = [label]
  while (true) {
    reader.pushState()
    const filler = minOf(0, Filler)(reader) ?? []
    const nextLabel = Label(reader, label.type)

    if (!nextLabel) {
      reader.restoreState()
      break
    }

    values = [...values, ...filler, nextLabel]
    reader.popState()
  }

  return {
    type: "attribute",
    label: label.type,
    value: values.flat(Infinity),
  }
}

const Label = (reader: TokenReader, type?: string) => {
  const isDesiredLabel =
    type === undefined ? !reader.isType("filler") : reader.isType(type)

  if (isDesiredLabel) {
    const result = reader.get()
    reader.next()
    return result
  }

  return null
}

const Filler = token("filler")

export default ProductPart
