import {
  and,
  any,
  or,
  restructure,
} from "../operators/index.js"
import {
  EntityStart,
  EntityEnd,
  Id,
} from "./symbols.js"
import { IsString, IsSymbol } from "./values.js"
import { type PropertyDefinition, Property, AnyProperty } from "./properties.js"

type Schema = Record<string, string | PropertyDefinition>

const normalizeSchema = (
  inputSchema: Schema,
): Record<string, PropertyDefinition> =>
  Object.fromEntries(
    Object.entries(inputSchema).map(([k, v]) => [
      k,
      typeof v === "string" ? { name: v } : v,
    ]),
  )

export const Entity = (rawSchema: Schema) => {
  const schema = normalizeSchema(rawSchema)
  const properties = Object.entries(schema).map(([k, d]) =>
    Property(k, d),
  )

  return restructure(
    and(
      IsSymbol(EntityStart),
      IsString(),
      any(or(...properties, AnyProperty)),
      IsSymbol(EntityEnd),
    ),
    ([s, id, entries, e]) => ({
      ...Object.fromEntries(
        entries
          .flat()
          .filter(({ key }) => !!key)
          .map(({ key, value }) => [
            key,
            value.length === 1 ? value[0] : value,
          ]),
      ),
      [Id]: id,
    }),
  )
}
