import { EntityStart, EntityEnd, Id } from "../../../lexer/index.js"
import { type EntityToken } from "../../types.js"
import {
  and,
  any,
  or,
  restructure,
  given,
  Token,
} from "../../operators/index.js"
import { type PropertyDefinition } from "./propertyTypes.js"
import { Any, IsData, IsSymbol } from "./values.js"
import { DefinedProperty, AnyProperty, DataProperty } from "./properties.js"

export const Required = Symbol("Required key")

type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never
type RequiredDefinition = { key: string; value: string }

export type Schema = Record<
  string,
  string | DistributiveOmit<PropertyDefinition, "key">
> & { [Required]: RequiredDefinition }

const extractDefinitions = (inputSchema: Schema): PropertyDefinition[] =>
  Object.entries(inputSchema).map(([key, v]) => ({
    key,
    ...(typeof v === "string" ? { name: v } : v),
  }))

const RequiredProperty = ({ key: name, value }: RequiredDefinition) =>
  any(
      or(DataProperty({
    key: Required,
    name,
    value,
  }),
        Token<EntityToken>((t) => t !== EntityEnd),
      ),
    )
  
const hasRequired = (match: NonNullable<unknown>[]) =>
  match.some(
    (m) => typeof m === "object" && "key" in m && m.key === Required,
  )

export const Properties = (schema: Schema) => {
  const definedProperties = extractDefinitions(schema).map(DefinedProperty)

  return restructure(
    given(
      RequiredProperty(schema[Required]),
      hasRequired,
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

export const Ontology = (schemas: Schema[]) =>
  restructure(any(or(...schemas.map(Entity), Any)), (candidates) =>
    candidates.filter((c) => typeof c === "object"),
  )
