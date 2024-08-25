import { and, any, or, restructure, given } from "../operators/index.js"
import { EntityStart, EntityEnd, Id, Required } from "./symbols.js"
import { IsString, IsSymbol } from "./values.js"
import { type PropertyDefinition, Property, AnyProperty, StringProperty } from "./properties.js"

type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never

type Schema = Record<
  string,
  string | DistributiveOmit<PropertyDefinition, "key">
> & { [Required]: { key: string, value: string }}

const definitions = (inputSchema: Schema): PropertyDefinition[] =>
  Object.entries(inputSchema).map(([key, v]) => ({
    key,
    ...(typeof v === "string" ? { name: v } : v),
  }))

type PropertyResult = { key?: string | symbol; value: any[] }
const reduceProperties = (properties: (PropertyResult | PropertyResult[])[]) =>
  Object.fromEntries(
    properties
      .flat()
      .filter(({ key }) => !!key)
      .map(({ key, value }) => [key, value.length === 1 ? value[0] : value]),
  )

export const Entity = (schema: Schema) => {
  const requiredProperty = StringProperty({ key: Required, name: schema[Required].key, value: schema[Required].value })
  const definedProperties = definitions(schema).map(Property)
  const properties = given(requiredProperty, any(or(...definedProperties, AnyProperty)))

  return restructure(
    and(
      IsSymbol(EntityStart),
      IsString(),
      properties,
      IsSymbol(EntityEnd),
    ),
    ([s, id, parsedProperties, e]) => ({
      ...reduceProperties(parsedProperties),
      [Id]: id,
    }),
  )
}
