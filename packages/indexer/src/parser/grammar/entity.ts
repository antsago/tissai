import { and, any, or, restructure } from "../operators/index.js"
import { EntityStart, EntityEnd, Id } from "./symbols.js"
import { IsString, IsSymbol } from "./values.js"
import {
  type PropertyDefinition,
  Property,
  AnyProperty,
  StringProperty,
  ParsedProperty,
} from "./properties.js"

type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never

type Schema = Record<
  string,
  string | DistributiveOmit<PropertyDefinition, "key">
>

const definitions = (inputSchema: Schema): PropertyDefinition[] =>
  Object.entries(inputSchema).map(([key, v]) => ({
    key,
    ...(typeof v === "string" ? { name: v } : v),
  }))

type ParsedProperty = { key?: string; value: any[] }
const reduceProperties = (properties: (ParsedProperty | ParsedProperty[])[]) =>
  Object.fromEntries(
    properties
      .flat()
      .filter(({ key }) => !!key)
      .map(({ key, value }) => [key, value.length === 1 ? value[0] : value]),
  )
export const Entity = (schema: Schema) => {
  const definedProperties = definitions(schema).map(Property)

  return restructure(
    and(
      IsSymbol(EntityStart),
      IsString(),
      any(or(...definedProperties, AnyProperty)),
      IsSymbol(EntityEnd),
    ),
    ([s, id, parsedProperties, e]) => ({
      ...reduceProperties(parsedProperties),
      [Id]: id,
    }),
  )
}
