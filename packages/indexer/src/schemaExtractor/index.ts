import { Attribute, Db, query } from "@tissai/db"

const BOOLEAN = "boolean"
const STRING = "string"
type BaseSchema = Record<string, string>
type Schema = Record<string, string | string[]>
const SCHEMAS = {} as Record<string, Schema>

const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

function createSchema(attributes: Attribute[]) {
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

function mergeSchemas(newSchema: BaseSchema, oldSchema: Schema) {
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

const db = Db()

const products = await db.stream(
  query
    .selectFrom("products")
    .innerJoin("attributes", "attributes.product", "products.id")
    .select(({ fn }) => [
      "products.id",
      fn.jsonAgg("attributes").as("attributes"),
    ])
    .groupBy("products.id")
    .compile(),
)

for await (let product of products) {
  const normalized = product.attributes.map((a) => ({
    id: a.id,
    product: a.product,
    label: normalizeString(a.label),
    value: normalizeString(a.value),
  }))
  const schema = createSchema(normalized)

  if (!schema) {
    continue
  }

  const { categoria, ...newSchema } = schema
  const oldSchema = SCHEMAS[categoria]

  SCHEMAS[categoria] = !oldSchema
    ? newSchema
    : mergeSchemas(newSchema, oldSchema)
}

console.log(JSON.stringify(SCHEMAS))

await db.close()
