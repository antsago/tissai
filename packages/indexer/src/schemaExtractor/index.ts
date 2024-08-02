import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import matchLabels from "./matchLabels.js"
import { type Schema, mergeSchemas, createSchema } from "./mergeSchemas.js"
import normalize, { type Vocabulary } from "./normalize.js"

const SCHEMAS = {} as Record<string, Schema>
const VOCABULARY = {} as Record<string, Vocabulary>

type Mapping = Record<string, number>
const TOKEN_LABEL_MAPPING = {} as Record<string, Mapping>

// const currentDirectory = dirname(fileURLToPath(import.meta.url))
// const python: PythonPool<string, string[]> = PythonPool(
//   `${currentDirectory}/tissaiTokenizer.py`,
//   console,
// )

const db = Db()

const products = await db.stream(
  query
    .selectFrom("products")
    .innerJoin("attributes", "attributes.product", "products.id")
    .select(({ fn }) => [
      "products.id",
      "products.title",
      fn.jsonAgg("attributes").as("attributes"),
    ])
    .groupBy(["products.id"])
    .compile(),
)

// let skippedProducts = 0

for await (let { title, attributes } of products) {
  const normalized = normalize(attributes, VOCABULARY)
  const schema = createSchema(normalized)

  if (!schema) {
    continue
  }

  const { categoria, ...newSchema } = schema
  const oldSchema = SCHEMAS[categoria]

  SCHEMAS[categoria] = !oldSchema
    ? newSchema
    : mergeSchemas(newSchema, oldSchema)

  // try {
  //   const tokens = await python.send(title)
  //   const mappings = matchLabels(tokens, attributes)
  //   mappings.forEach(({ token, label }) => {
  //     if (!(token in TOKEN_LABEL_MAPPING)) {
  //       TOKEN_LABEL_MAPPING[token] = { [label]: 1 }
  //     } else if (label in TOKEN_LABEL_MAPPING[token]) {
  //       TOKEN_LABEL_MAPPING[token][label] += 1
  //     } else {
  //       TOKEN_LABEL_MAPPING[token][label] = 1
  //     }
  //   })
  // } catch (err) {
  //   skippedProducts += 1
  // }
}

// console.log(JSON.stringify({ TOKEN_LABEL_MAPPING, skippedProducts }))
console.log(JSON.stringify({ SCHEMAS, VOCABULARY }))

await db.close()
// await python.close()
