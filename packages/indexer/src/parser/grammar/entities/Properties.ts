import { EntityEnd } from "../../../lexer/index.js"
import { type EntityToken } from "../../types.js"
import {
  any,
  or,
  restructure,
  given,
  Token,
} from "../../operators/index.js"
import { type PropertyDefinition } from "./types.js"
import { AnyProperty } from "./AnyProperty.js"
import { DataProperty } from "./DataProperty.js"
import { DefinedProperty } from "./DefinedProperty.js"
import { Required, type Schema, type RequiredDefinition } from "./types.js"

const extractDefinitions = (inputSchema: Schema): PropertyDefinition[] =>
  Object.entries(inputSchema).map(([key, v]) => ({
    key,
    ...(typeof v === "string" ? { name: v } : v),
  }))

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
