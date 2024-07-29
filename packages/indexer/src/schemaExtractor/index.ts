import { Attribute, Db, query } from "@tissai/db"

const BOOLEAN = 'boolean'
const STRING = 'string'
type BaseSchema = Record<string, string>
type Schema = Record<string, string|string[]>
const SCHEMAS = {} as Record<string, Schema>

function createSchema(attributes: Attribute[]) {
  const categoría = attributes.filter(({ label }) => label === "categoría")

  if (categoría.length !== 1) {
    return
  }

  return attributes.reduce((schema, attribute) => {
    return {
      ...schema,
      [attribute.label]: attribute.label === attribute.value ? BOOLEAN : attribute.value
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

    if(!Array.isArray(oldType)) {
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

    if ((newType === BOOLEAN && oldType.includes(label)) || oldType.includes(newType)) {
      return merged
    }

    if(newType.length > 5) {
      return {
        ...merged,
        [label]: STRING,
      }
    }

    if (newType === BOOLEAN) {
      return {
        ...merged,
        [label]: [...oldType, label]
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
    .compile()
)

for await (let product of products) {
  console.log(product.id)
  const schema = createSchema(product.attributes)

  if (!schema) {
    continue
  }

  const { categoría, ...newSchema } = schema
  const oldSchema = SCHEMAS[categoría]

  SCHEMAS[categoría] = !oldSchema ? newSchema : mergeSchemas(newSchema, oldSchema)
}

console.log(JSON.stringify(SCHEMAS))

await db.close()
