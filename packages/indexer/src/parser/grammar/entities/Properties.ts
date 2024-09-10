import { EntityEnd } from "../../lexer/index.js"
import { type EntityToken } from "../../types.js"
import { any, or, restructure, given, Token } from "../../operators/index.js"
import { type PropertyDefinition } from "./types.js"
import { AnyProperty } from "./AnyProperty.js"
import { DataProperty } from "./DataProperty.js"
import { DefinedProperty } from "./DefinedProperty.js"
import { Required, type Schema, type RequiredDefinition } from "./types.js"

const RequiredProperty = ({ key: name, value }: RequiredDefinition) =>
  any(
    or(
      DataProperty({
        key: Required,
        name,
        value,
      }),
      Token<EntityToken>((t) => t !== EntityEnd),
    ),
  )

const hasRequired = (match: NonNullable<unknown>[]) =>
  match.some((m) => typeof m === "object" && "key" in m && m.key === Required)

const extractDefinitions = (inputSchema: Schema): PropertyDefinition[] =>
  Object.entries(inputSchema).map(([key, v]) => ({
    key,
    ...(typeof v === "string" ? { name: v } : v),
  }))

const ExtractProperties = (schema: Schema) => {
  const definitions = extractDefinitions(schema)

  return restructure(
    any(or(...definitions.map(DefinedProperty), AnyProperty)),
    (properties) =>
      Object.fromEntries(
        properties
          .flat()
          .filter(({ key }) => !!key)
          .map(({ key, value }) => [key, value]),
      ) as Record<string, any[]>,
  )
}

export const Properties = (schema: Schema) =>
  given(
    RequiredProperty(schema[Required]),
    hasRequired,
    ExtractProperties(schema),
  )
