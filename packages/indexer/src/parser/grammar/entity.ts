import type { EntityToken, Rule } from "../types.js"
import {
  and,
  any,
  or,
  Token,
  parseAs,
  restructure,
} from "../operators/index.js"
import { Equals, ValueSeparator, PropertyEnd } from "./index.js"

const IsString = (text?: string) =>
  Token(
    (token: EntityToken) =>
      typeof token !== "symbol" && (text === undefined || token === text),
  )
const IsSymbol = (symbol: symbol) =>
  Token((token: EntityToken) => token === symbol)

const Multiple = <Output>(Value: Rule<EntityToken, Output>) => {
  return restructure(
    and(Value, any(and(IsSymbol(ValueSeparator), Value))),
    (tokens) =>
      tokens.flat(Infinity).filter((t) => typeof t !== "symbol") as NonNullable<
        Awaited<Output>
      >[],
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
    and(
      IsString(propertyName),
      IsSymbol(Equals),
      Multiple(IsString()),
      IsSymbol(PropertyEnd),
    ),
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
      Multiple(parseAs(definition.parse.with)),
      IsSymbol(PropertyEnd),
    ),
    ([k, eq, value]) => [
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

const Property = (key: string, definition: PropertyDefinition) =>
  definition.parse !== undefined
    ? ParsedProperty(key, definition as Required<PropertyDefinition>)
    : StringProperty(key, definition.key)

export const Entity = (rawSchema: Schema) => {
  const schema = normalizeSchema(rawSchema)
  const properties = Object.entries(schema).map(([k, d]) => Property(k, d))

  return restructure(any(or(...properties)), (entries) =>
    Object.fromEntries(
      entries
        .flat()
        .map(({ key, value }) => [key, value.length === 1 ? value[0] : value]),
    ),
  )
}
