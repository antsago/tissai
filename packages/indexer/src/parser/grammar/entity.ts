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
import { Attributes } from "./attributes.js"

const IsString = (text?: string) =>
  Token(
    (token: EntityToken) =>
      typeof token !== "symbol" && (text === undefined || token === text),
  )
const IsSymbol = (symbol: symbol) =>
  Token((token: EntityToken) => token === symbol)

const Array = <Output>(Value: Rule<EntityToken, Output>) => {
  return restructure(
    and(
      Value,
      any(and(IsSymbol(ValueSeparator), Value)),
    ),
    (tokens) => {
      const value = tokens.flat(Infinity).filter((t) => typeof t !== "symbol")

      return value?.length === 1 ? value[0] : value
    },
  )
}

type PropertyDefinition = {
  key: string
  parse?: { as: string; with: (text: string) => any }
}
type Schema = Record<string, string | PropertyDefinition>

const normalizeSchema = (
  inputSchema: Schema,
): Record<string, PropertyDefinition> =>
  Object.fromEntries(
    Object.entries(inputSchema).map(([k, v]) => [
      k,
      typeof v === "string" ? { key: v } : v,
    ]),
  )

const StringProperty = (key: string, propertyName: string) =>
  restructure(
    and(IsString(propertyName), IsSymbol(Equals), Array(IsString()), IsSymbol(PropertyEnd)),
    ([k, eq, value]) => ({ key, value }),
  )

const ParsedProperty = (
  key: string,
  definition: Required<PropertyDefinition>,
) =>
  restructure(
    and(
      IsString(definition.key),
      IsSymbol(Equals),
      Array(parseAs(definition.parse.with)),
      IsSymbol(PropertyEnd),
    ),
    ([k, eq, value]) => [
      { key, value: (value as { token: string }).token },
      {
        key: definition.parse.as,
        value: (value as { parsed: any }).parsed,
      },
    ],
  )

const Property = (key: string, definition: PropertyDefinition) =>
  definition.parse !== undefined
    ? ParsedProperty(key, definition as Required<PropertyDefinition>)
    : StringProperty(key, definition.key)

export const Entity = (rawSchema: Schema) => {
  const schema = normalizeSchema(rawSchema)
  const properties = Object.entries(schema).map(([k, d]) => Property(k, d))

  return restructure(any(or(...properties)), (entries) =>
    Object.fromEntries(entries.flat().map(({ key, value }) => [key, value])),
  )
}
