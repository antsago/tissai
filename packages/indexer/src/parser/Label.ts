import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"

const Label = (reader: TokenReader<Token>, desiredLabels?: string[]) => {
  const nextToken = reader.get()
  
  const hasDesiredLabels = 
    desiredLabels === undefined ? true : desiredLabels.some(desiredLabel => nextToken.labels.includes(desiredLabel))

  if (nextToken.isMeaningful && hasDesiredLabels) {
    const result = reader.get()
    reader.next()
    return result
  }

  return null
}

export default Label
