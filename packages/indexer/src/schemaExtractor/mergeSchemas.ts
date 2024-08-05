import { Attribute } from "@tissai/db"
import _ from "lodash"

export type BaseSchema = Record<string, string>
export type Schema = Record<string, string[]>

export function createSchema(attributes: Pick<Attribute, "label" | "value">[]) {
  const categoria = attributes.filter(({ label }) => label === "categoria")

  if (categoria.length !== 1) {
    return
  }

  return attributes.reduce((schema, attribute) => {
    return {
      ...schema,
      [attribute.label]: attribute.value,
    }
  }, {} as BaseSchema)
}

export function mergeSchemas(newSchema: BaseSchema, oldSchema?: Schema) {
  if (oldSchema === undefined) {
    return Object.fromEntries(
      Object.entries(newSchema).map(([key, value]) => [key, [value]]),
    )
  }

  return Object.entries(newSchema).reduce((merged, [label, newType]) => {
    if (!merged[label]) {
      return {
        ...merged,
        [label]: [newType],
      }
    }

    const oldType = merged[label]
    if (oldType.includes(newType)) {
      return merged
    }

    return {
      ...merged,
      [label]: [...oldType, newType],
    }
  }, oldSchema)
}
