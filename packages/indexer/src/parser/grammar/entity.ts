import type { EntityToken, Rule } from "../types.js"
import {
  and,
  any,
  or,
  Token,
  parseAs,
  restructure,
} from "../operators/index.js"
import {
  Equals,
  ValueSeparator,
  PropertyEnd,
  EntityStart,
  EntityEnd,
  PropertyStart,
  Id,
} from "./symbols.js"
import { IsString, IsSymbol, IsAny } from "./values.js"

const PropertyValue = <Output>(Type: Rule<EntityToken, Output>) => {
  return restructure(
    and(Type, any(and(IsSymbol(ValueSeparator), Type))),
    (tokens) =>
      tokens.flat(Infinity).filter((t) => typeof t !== "symbol") as NonNullable<
        Awaited<Output>
      >[],
  )
}

type StringDefinition = { name: string }
type ParsedDefinition = {
  name: string
  parse: { as: string; with: (text: string) => any }
}
type ReferenceDefinition = {
  name: string
  isReference: true
}
type PropertyDefinition =
  | StringDefinition
  | ParsedDefinition
  | ReferenceDefinition
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

const PropertyOfType = <Output>(Type: Rule<EntityToken, Output>, name?: string) =>
  restructure(
    and(
      IsSymbol(PropertyStart),
      IsString(name),
      IsSymbol(Equals),
      PropertyValue(Type),
      IsSymbol(PropertyEnd),
    ),
    ([s, n, eq, value, e]) => value,
  )

const StringProperty = (key: string, { name }: StringDefinition) =>
  restructure(PropertyOfType(IsString(), name), (value) => ({ key, value }))

const ReferenceProperty = (key: string, { name }: ReferenceDefinition) =>
  restructure(PropertyOfType(and(IsSymbol(Id), IsString()), name), (value) => ({
    key,
    value,
  }))

const AnyProperty = restructure(PropertyOfType(any(IsAny)), (value) => ({
  key: undefined,
  value,
}))

const ParsedProperty = (key: string, definition: ParsedDefinition) =>
  restructure(
    PropertyOfType(parseAs(definition.parse.with), definition.name),
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

const Property = (key: string, definition: PropertyDefinition) =>
  "parse" in definition
    ? ParsedProperty(key, definition)
    : "isReference" in definition
      ? ReferenceProperty(key, definition)
      : StringProperty(key, definition)

export const Entity = (rawSchema: Schema) => {
  const schema = normalizeSchema(rawSchema)
  const properties = Object.entries(schema).map(([k, d]) =>
    Property(k, d),
  )

  return restructure(
    and(
      IsSymbol(EntityStart),
      IsString(),
      any(or(...properties, AnyProperty)),
      IsSymbol(EntityEnd),
    ),
    ([s, id, entries, e]) => ({
      ...Object.fromEntries(
        entries
          .flat()
          .filter(({ key }) => !!key)
          .map(({ key, value }) => [
            key,
            value.length === 1 ? value[0] : value,
          ]),
      ),
      [Id]: id,
    }),
  )
}
