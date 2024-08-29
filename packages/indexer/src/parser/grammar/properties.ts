import type { DataToken, EntityToken, Rule } from "../types.js"
import { and, any, restructure } from "../operators/index.js"
import {
  Equals,
  ValueSeparator,
  PropertyEnd,
  PropertyStart,
  Id,
} from "../../lexer/index.js"
import { IsData, IsSymbol, IsValue, IsParsed } from "./values.js"

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
      IsData(name),
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
type DataDefinition = BaseDefinition & {
  value?: DataToken
}
export const DataProperty = ({ key, name, value }: DataDefinition) =>
  restructure(PropertyOfType(IsData(value), name), (dataValues) => ({
    key,
    value: dataValues,
  }))

type ReferenceDefinition = BaseDefinition & {
  isReference: true
}
export const ReferenceProperty = ({ key, name }: ReferenceDefinition) =>
  restructure(
    PropertyOfType(and(IsSymbol(Id), IsData()), name),
    (references) => ({
      key,
      value: references.map((r) => ({ [Id]: r })),
    }),
  )

type ParsedDefinition = BaseDefinition & {
  parse: { as: string; with: (text: string) => any }
}

export const ParsedProperty = ({ key, name, parse }: ParsedDefinition) =>
  restructure(PropertyOfType(IsParsed(parse.with), name), (values) => [
    {
      key: key,
      value: values.map(({ token }) => token),
    },
    {
      key: parse.as,
      value: values.map(({ parsed }) => parsed),
    },
  ])

export const AnyProperty = restructure(
  PropertyOfType(any(IsValue)),
  (value) => ({
    key: undefined,
    value,
  }),
)

export type PropertyDefinition =
  | DataDefinition
  | ParsedDefinition
  | ReferenceDefinition

export const Property = (definition: PropertyDefinition) =>
  "parse" in definition
    ? ParsedProperty(definition)
    : "isReference" in definition
      ? ReferenceProperty(definition)
      : DataProperty(definition)
