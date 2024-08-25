import type { EntityToken, WordToken, Rule } from "../types.js"
import type { Compiler } from "../Compiler.js"
import {
  withL,
  and,
  any,
  or,
  Token,
  parseAs,
  restructure,
  type Context,
} from "../operators/index.js"
import { Equals, ValueSeparator, PropertyEnd } from "./index.js"

export const productGrammar = (compileGrammar: Compiler["compile"]) => {
  // Attributes SubGrammar
  const Filler = Token((word: WordToken) => !word.isMeaningful)
  const Label = (context: Context) =>
    Token(
      (word: WordToken) =>
        word.isMeaningful && context.narrow(word.labels) !== null,
    )
  const Attribute = restructure(
    withL((l) => and(Label(l), any(and(any(Filler), Label(l))))),
    ({ result, context }) => {
      const text = (result.flat(Infinity) as WordToken[])
        .map((t: WordToken) => t.text)
        .join(" ")
      return { text, labels: context.labels }
    },
  )
  const Attributes = any(or(Attribute, Filler))

  // ProductGrammar
  const IsString = (text?: string) =>
    Token(
      (token: EntityToken) =>
        typeof token !== "symbol" && (text === undefined || token === text),
    )
  const IsSymbol = (symbol: symbol) =>
    Token((token: EntityToken) => token === symbol)
  const ParsedValue = parseAs(compileGrammar(Attributes))

  const EQ = IsSymbol(Equals)
  const VS = IsSymbol(ValueSeparator)
  const PE = IsSymbol(PropertyEnd)

  const Array = <Output>(Value: Rule<EntityToken, Output>) => {
    return restructure(and(Value, any(and(VS, Value)), PE), (tokens) => {
      const value = tokens.flat(Infinity).filter((t) => typeof t !== "symbol")

      return value?.length === 1 ? value[0] : value
    })
  }

  type PropertyDefinition = { key: string; parseAs: string }
  type Schema = Record<string, string | PropertyDefinition>

  const Property = (key: string, definition: PropertyDefinition) =>
    restructure(
      and(IsString(definition.key), EQ, definition.parseAs ? Array(ParsedValue) : Array(IsString())),
      ([, , value]) => definition.parseAs 
        ? [{key, value: (value as { token: string }).token}, { key: definition.parseAs, value: (value as { parsed: any }).parsed}]
        : {key, value},
    )

  const Entity = (rawSchema: Schema) => {
    const schema = Object.fromEntries(
      Object.entries(rawSchema).map(([k, v]) => [
        k,
        typeof v === "string" ? { key: v, parseAs: "" } : v,
      ]),
    )
    const properties = Object.entries(schema).map(([k, d]) => Property(k, d))

    return restructure(any(or(...properties)), (entries) =>
      Object.fromEntries(entries.flat().map(({ key, value }) => [key, value])),
    )
  }

  const Product = Entity({
    title: {
      key: "name",
      parseAs: "attributes",
    },
    description: "description",
    images: "image",
  })

  return Product
}
