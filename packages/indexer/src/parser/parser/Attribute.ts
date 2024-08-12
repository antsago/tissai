import _ from "lodash"
import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"
import Filler from "./Filler.js"
import Label from "./Label.js"

type Check<T> = (reader: TokenReader<Token>) => T

const any =
  <T>(check: Check<T>) =>
  (reader: TokenReader<Token>) => {
    const results = [] as NonNullable<T>[]

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

type CheckToResult<T extends Check<unknown>[]> = { [K in keyof T]: T[K] extends Check<infer I> ? NonNullable<I> : never }
const and = <T extends Check<unknown>[]>(...checks: T) => (reader: TokenReader<Token>) => {
  const result = [] as CheckToResult<T>

  for (const check of checks) {
    const match = check(reader)
    if (!match) {
      return null
    }

    result.push(match)
  }

  return result
}

const labelWithFiller = (reader: TokenReader<Token>, initialTypes: string[]) => {
  let values = [] as Token[]
  let types = [...initialTypes]
  while (reader.hasNext()) {
    reader.savePosition()

    const results = and(any(Filler), Label(types))(reader)

    if (!results) {
      reader.restoreSave()
      break
    }

    const [filler, label] = results
    values = [...values, ...filler, label]
    types = _.intersection(types, label.labels)
    reader.discardSave()
  }

  return [values, types]
}

const Attribute = (reader: TokenReader<Token>) => {
  const label = Label()(reader)

  if (!label) {
    return null
  }

  const [values, types] = labelWithFiller(reader, label.labels)

  return {
    type: "attribute",
    labels: types,
    value: [label, values].flat(Infinity),
  }
}

export default Attribute
