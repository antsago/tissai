import { Attribute } from "@tissai/db"

export type BaseSchema = Record<string, string>
export type Schema = Record<string, string | string[]>

const BOOLEAN = "boolean"
const STRING = "string"

export function createSchema(attributes: Attribute[]) {
  const categoria = attributes.filter(({ label }) => label === "categoria")

  if (categoria.length !== 1) {
    return
  }

  return attributes.reduce((schema, attribute) => {
    return {
      ...schema,
      [attribute.label]:
        attribute.label === attribute.value ? BOOLEAN : attribute.value,
    }
  }, {} as BaseSchema)
}

export function mergeSchemas(newSchema: BaseSchema, oldSchema: Schema) {
  return Object.entries(newSchema).reduce((merged, [label, newType]) => {
    if (!merged[label]) {
      return {
        ...merged,
        [label]: newType,
      }
    }

    const oldType = merged[label]
    if (oldType === newType) {
      return merged
    }

    if (oldType === BOOLEAN) {
      return {
        ...merged,
        [label]: [label, newType],
      }
    }

    if (oldType === STRING) {
      return merged
    }

    if (!Array.isArray(oldType)) {
      if (newType === BOOLEAN) {
        return {
          ...merged,
          [label]: [oldType, label],
        }
      }

      return {
        ...merged,
        [label]: [oldType, label],
      }
    }

    if (
      (newType === BOOLEAN && oldType.includes(label)) ||
      oldType.includes(newType)
    ) {
      return merged
    }

    if (newType.length > 5) {
      return {
        ...merged,
        [label]: STRING,
      }
    }

    if (newType === BOOLEAN) {
      return {
        ...merged,
        [label]: [...oldType, label],
      }
    }

    return {
      ...merged,
      [label]: [...oldType, newType],
    }
  }, oldSchema)
}
