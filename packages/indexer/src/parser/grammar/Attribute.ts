import type TokenReader from "../TokenReader.js"
import { type Token } from "../TokenReader.js"
import { withL, and, any } from "../operators/index.js"
import Filler from "./Filler.js"
import Label from "./Label.js"

const Attribute = (reader: TokenReader<Token>) => {
  const match = withL((l) => and(Label(l), any(and(any(Filler), Label(l)))))(
    reader,
  )

  return match === null
    ? null
    : {
        type: "attribute",
        labels: match.context.labels!,
        value: match.result.flat(Infinity),
      }
}

export default Attribute
