import type { EntityToken, Rule } from "../types.js"
import { and, any, restructure } from "../operators/index.js"
import {
  Equals,
  ValueSeparator,
  PropertyEnd,
  PropertyStart,
  Id,
} from "./symbols.js"
import { IsString, IsSymbol, IsValue, IsParsed } from "./values.js"

const PropertyValue = <Output>(Type: Rule<EntityToken, Output>) => {
  return restructure(
    and(Type, any(and(IsSymbol(ValueSeparator), Type))),
    (tokens) =>
      tokens.flat(Infinity).filter((t) => typeof t !== "symbol") as NonNullable<
        Awaited<Output>
      >[],
  )
}

const PropertyOfType = <Output>(
  Type: Rule<EntityToken, Output>,
  name?: string,
) =>
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

type BaseDefinition = {
  key: string | symbol
  name: string
}
type StringDefinition = BaseDefinition & {
  value?: string
}
export const StringProperty = ({ key, name, value }: StringDefinition) =>
  restructure(PropertyOfType(IsString(value), name), (value) => ({
    key,
    value,
  }))

type ReferenceDefinition = BaseDefinition & {
  isReference: true
}
export const ReferenceProperty = ({ key, name }: ReferenceDefinition) =>
  restructure(PropertyOfType(and(IsSymbol(Id), IsString()), name), (value) => ({
    key,
    value,
  }))

type ParsedDefinition = BaseDefinition & {
  parse: { as: string; with: (text: string) => any }
}

export const ParsedProperty = ({ key, name, parse }: ParsedDefinition) =>
  restructure(PropertyOfType(IsParsed(parse.with), name), (value) => [
    {
      key: key,
      value: value.map(({ token }) => token),
    },
    {
      key: parse.as,
      value: value.map(({ parsed }) => parsed),
    },
  ])

export const AnyProperty = restructure(PropertyOfType(any(IsValue)), (value) => ({
  key: undefined,
  value,
}))

export type PropertyDefinition =
  | StringDefinition
  | ParsedDefinition
  | ReferenceDefinition

export const Property = (definition: PropertyDefinition) =>
  "parse" in definition
    ? ParsedProperty(definition)
    : "isReference" in definition
      ? ReferenceProperty(definition)
      : StringProperty(definition)
