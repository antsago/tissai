import type { EntityToken, Rule } from "../types.js"
import {
  and,
  any,
  or,
  Token,
  parseAs,
  restructure,
} from "../operators/index.js"
import { Equals, ValueSeparator, PropertyEnd, EntityStart, EntityEnd, PropertyStart } from "./index.js"

const IsString = (text?: string) =>
  Token(
    (token: EntityToken) =>
      typeof token !== "symbol" && (text === undefined || token === text),
  )
const IsSymbol = (symbol: symbol) =>
  Token((token: EntityToken) => token === symbol)

const Value = <Output>(Type: Rule<EntityToken, Output>) => {
  return restructure(
    and(Type, any(and(IsSymbol(ValueSeparator), Type))),
    (tokens) =>
      tokens.flat(Infinity).filter((t) => typeof t !== "symbol") as NonNullable<
        Awaited<Output>
      >[],
  )
}

type PropertyDefinition = {
  name: string
  parse?: { as: string; with: (text: string) => any }
}
type Schema = Record<string, string | PropertyDefinition>

const normalizeSchema = (
  inputSchema: Schema,
): Record<string, PropertyDefinition> =>
  Object.fromEntries(
    Object.entries(inputSchema).map(([k, v]) => [
      k,
      typeof v === "string" ? { name: v } : v,
    ]),
  )

const Property = <Output>(Type: Rule<EntityToken, Output>, name?: string) =>
  restructure(
    and(
      IsSymbol(PropertyStart),
      IsString(name),
      IsSymbol(Equals),
      Value(Type),
      IsSymbol(PropertyEnd),
    ),
    ([s, n, eq, value, e]) => value,
  )
const StringProperty = (key?: string, propertyName?: string) =>
  restructure(
    Property(IsString(), propertyName),
    (value) => ({ key, value }),
  )

const ParsedProperty = (
  key: string,
  definition: Required<PropertyDefinition>,
) =>
  restructure(
    Property(parseAs(definition.parse.with), definition.name),
    (value) => [
      {
        key,
        value: value.map(({ token }) => token),
      },
      {
        key: definition.parse.as,
        value: value.map(({ parsed }) => parsed),
      },
    ],
  )

const DefinedProperty = (key: string, definition: PropertyDefinition) =>
  definition.parse !== undefined
    ? ParsedProperty(key, definition as Required<PropertyDefinition>)
    : StringProperty(key, definition.name)

export const Entity = (rawSchema: Schema) => {
  const schema = normalizeSchema(rawSchema)
  const properties = Object.entries(schema).map(([k, d]) => DefinedProperty(k, d))

  return restructure(
    and(IsSymbol(EntityStart), any(or(...properties, StringProperty())), IsSymbol(EntityEnd)),
    ([s,entries,e]) =>
    Object.fromEntries(
      entries
        .flat()
        .filter(({ key }) => !!key)
        .map(({ key, value }) => [key, value.length === 1 ? value[0] : value]),
    ),
  )
}
