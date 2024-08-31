import type { DataToken } from "../../types.js"
import { and, any, restructure } from "../../operators/index.js"
import { Id } from "../../../lexer/index.js"
import type {
  DataDefinition,
  ReferenceDefinition,
  ParsedDefinition,
  PropertyDefinition,
} from "./propertyTypes.js"
import { IsData, IsSymbol, IsValue } from "./values.js"
import { Property } from "./Property.js"

export const AnyProperty = restructure(Property(any(IsValue)), (value) => ({
  key: undefined,
  value,
}))

export const DataProperty = ({ key, name, value }: DataDefinition) =>
  restructure(Property(IsData(value), name), (dataValues) => ({
    key,
    value: dataValues,
  }))

export const ReferenceProperty = ({ key, name }: ReferenceDefinition) =>
  restructure(Property(and(IsSymbol(Id), IsData()), name), (references) => ({
    key,
    value: references.map((r) => ({ [Id]: r })),
  }))

const IsParsed = <Output>(parse: (text: string) => Output) =>
  restructure(IsData(), async (token) => {
    const parsed = await parse(token as string)
    return { token, parsed }
  })

export const ParsedProperty = ({ key, name, parse }: ParsedDefinition) =>
  restructure(Property(IsParsed(parse.with), name), (values) => [
    {
      key: key,
      value: values.map(({ token }) => token),
    },
    {
      key: parse.as,
      value: values.map(({ parsed }) => parsed),
    },
  ])

export const DefinedProperty = (definition: PropertyDefinition) =>
  "parse" in definition
    ? ParsedProperty(definition)
    : "isReference" in definition
      ? ReferenceProperty(definition)
      : DataProperty(definition)
