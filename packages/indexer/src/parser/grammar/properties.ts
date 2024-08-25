import type { EntityToken, Rule } from "../types.js"
import {
  and,
  any,
  parseAs,
  restructure,
} from "../operators/index.js"
import {
  Equals,
  ValueSeparator,
  PropertyEnd,
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

type StringDefinition = { name: string }
const StringProperty = (key: string, { name }: StringDefinition) =>
  restructure(PropertyOfType(IsString(), name), (value) => ({ key, value }))

type ReferenceDefinition = {
  name: string
  isReference: true
}
const ReferenceProperty = (key: string, { name }: ReferenceDefinition) =>
  restructure(PropertyOfType(and(IsSymbol(Id), IsString()), name), (value) => ({
    key,
    value,
  }))

type ParsedDefinition = {
  name: string
  parse: { as: string; with: (text: string) => any }
}
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

export const AnyProperty = restructure(PropertyOfType(any(IsAny)), (value) => ({
  key: undefined,
  value,
}))

export type PropertyDefinition =
  | StringDefinition
  | ParsedDefinition
  | ReferenceDefinition

export const Property = (key: string, definition: PropertyDefinition) =>
  "parse" in definition
    ? ParsedProperty(key, definition)
    : "isReference" in definition
      ? ReferenceProperty(key, definition)
      : StringProperty(key, definition)
