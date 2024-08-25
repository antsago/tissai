import type { EntityToken, Rule } from "../types.js"
import type { Compiler } from "../Compiler.js"
import {
  and,
  any,
  or,
  Token,
  parseAs,
  restructure,
} from "../operators/index.js"
import { Equals, ValueSeparator, PropertyEnd } from "./index.js"
import { Attributes } from "./attribute.js"

const IsString = (text?: string) =>
  Token(
    (token: EntityToken) =>
      typeof token !== "symbol" && (text === undefined || token === text),
  )
const IsSymbol = (symbol: symbol) =>
  Token((token: EntityToken) => token === symbol)

const Array = <Output>(Value: Rule<EntityToken, Output>) => {
  return restructure(and(Value, any(and(IsSymbol(ValueSeparator), Value)), IsSymbol(PropertyEnd)), (tokens) => {
    const value = tokens.flat(Infinity).filter((t) => typeof t !== "symbol")

    return value?.length === 1 ? value[0] : value
  })
}

type PropertyDefinition = { key: string; parseAs: string }
type Schema = Record<string, string | PropertyDefinition>

const StringProperty = (key: string, definition: PropertyDefinition) =>
  restructure(
    and(IsString(definition.key), IsSymbol(Equals), Array(IsString())),
    ([, , value]) => ({ key, value }),
  )

export const productGrammar = (compileGrammar: Compiler["compile"]) => {
  const ParsedValue = parseAs(compileGrammar(Attributes))

  const ParsedProperty = (key: string, definition: PropertyDefinition) =>
    restructure(
      and(IsString(definition.key), IsSymbol(Equals), Array(ParsedValue)),
      ([, , value]) => [
        { key, value: (value as { token: string }).token },
        {
          key: definition.parseAs,
          value: (value as { parsed: any }).parsed,
        },
      ],
    )

  const Property = (key: string, definition: PropertyDefinition) =>
    definition.parseAs
      ? ParsedProperty(key, definition)
      : StringProperty(key, definition)

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
