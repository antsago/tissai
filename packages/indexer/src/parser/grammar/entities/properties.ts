import type { DataToken } from "../../types.js"
import { and, any, restructure } from "../../operators/index.js"
import { Id } from "../../../lexer/index.js"
import type {
  DataDefinition,
  ReferenceDefinition,
  ParsedDefinition,
  PropertyDefinition,
} from "./types.js"
import { IsData, IsSymbol } from "./values.js"
import { Property } from "./Property.js"
import { DataProperty } from "./DataProperty.js"

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
