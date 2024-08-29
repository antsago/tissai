import { and, any, or, restructure, given, unless } from "../operators/index.js"
import { EntityStart, EntityEnd, Id, Required } from "../../lexer/index.js"
import { IsData, IsSymbol } from "./values.js"
import {
  type PropertyDefinition,
  Property,
  AnyProperty,
  DataProperty,
} from "./properties.js"

type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never

export type Schema = Record<
  string,
  string | DistributiveOmit<PropertyDefinition, "key">
> & { [Required]: { key: string; value: string } }

const definitions = (inputSchema: Schema): PropertyDefinition[] =>
  Object.entries(inputSchema).map(([key, v]) => ({
    key,
    ...(typeof v === "string" ? { name: v } : v),
  }))

export const Properties = (schema: Schema) => {
  const requiredProperty = DataProperty({
    key: Required,
    name: schema[Required].key,
    value: schema[Required].value,
  })
  const definedProperties = definitions(schema).map(Property)

  return restructure(
    given(
      unless(IsSymbol(EntityEnd), requiredProperty),
      any(or(...definedProperties, AnyProperty)),
    ),
    (properties) =>
      Object.fromEntries(
        properties
          .flat()
          .filter(({ key }) => !!key)
          .map(({ key, value }) => [
            key,
            value.length === 1 ? value[0] : value,
          ]),
      ),
  )
}

export const Entity = (schema: Schema) =>
  restructure(
    and(
      IsSymbol(EntityStart),
      IsData(),
      Properties(schema),
      IsSymbol(EntityEnd),
    ),
    ([s, id, parsedProperties, e]) => ({
      ...parsedProperties,
      [Id]: id,
    }),
  )

export const Ontology = (schemas: Schema[]) => any(or(...schemas.map(Entity)))
