import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"
import Filler from "./Filler.js"
import Attribute from "./Attribute.js"

// ProductPart -> Attribute | Filler
const ProductPart = <T extends Token>(reader: TokenReader<T>) => {
  return Attribute(reader) ?? Filler(reader)
}

export default ProductPart
