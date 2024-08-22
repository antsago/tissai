import _ from "lodash"
import type TokenReader from "./TokenReader.js"
import { type Token } from "./TokenReader.js"
import Filler from "./Filler.js"
import Label from "./Label.js"
import Context from "./Context.js"

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

type CheckToResult<T extends Check<unknown>[]> = {
  [K in keyof T]: T[K] extends Check<infer I> ? NonNullable<I> : never
}
const and =
  <T extends Check<unknown>[]>(...checks: T) =>
  (reader: TokenReader<Token>) => {
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

const withL =
  <T>(checkFactory: (l: Context) => Check<T>) =>
  (reader: TokenReader<Token>) => {
    const context = new Context()

    const check = checkFactory(context) 

    const result = check(reader)

    return { result, context }
  }

const Attribute = (reader: TokenReader<Token>) => {
  const { result, context } = withL(l => and(Label(l), any(and(any(Filler), Label(l)))))(reader)

  if (!result) {
    return null
  }

  const values = result.flat(Infinity)

  return {
    type: "attribute",
    labels: context.labels!,
    value: values,
  }
}

export default Attribute
