import { Db, query } from "@tissai/db"
import { type Schema, mergeSchemas, createSchema } from "./mergeSchemas.js"

const SCHEMAS = {} as Record<string, Schema>

const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

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
