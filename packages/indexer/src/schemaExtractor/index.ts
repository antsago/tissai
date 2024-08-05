import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import matchLabels, { type Token, tokenizeAttributes } from "./matchLabels.js"
import { type Schema, mergeSchemas, createSchema } from "./mergeSchemas.js"
import normalize, { type Vocabulary } from "./normalize.js"

const SCHEMAS = {} as Record<string, Schema>
const VOCABULARY = {} as Record<string, Vocabulary>

type LabelCount = Record<string, number>
const TOKEN_LABEL_MAPPING = {} as Record<string, LabelCount>
let MAPPINGS!: Record<string, Record<string, string[]>>

function schemaToMapping(schema: Schema) {
  const mapping = {} as Record<string, string[]>

  Object.entries(schema).forEach(([label, values]) => {
    values.forEach((value) => {
      if (!mapping[value]) {
        mapping[value] = [label]
      } else if (!mapping[value].includes(label)) {
        mapping[value] = [...mapping[value], label]
      }
    })
  })

  return mapping
}

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const python: PythonPool<string, Token[]> = PythonPool(
  `${currentDirectory}/tissaiTokenizer.py`,
  console,
)

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

let skippedProducts = 0
for await (let { title, attributes } of products) {
  try {
    const tokens = await python.send(title)

    const mappings = matchLabels(
      tokens.map((t) => t.text),
      attributes,
    )
    mappings.forEach(({ token, label }) => {
      if (!(token in TOKEN_LABEL_MAPPING)) {
        TOKEN_LABEL_MAPPING[token] = { [label]: 1 }
      } else if (label in TOKEN_LABEL_MAPPING[token]) {
        TOKEN_LABEL_MAPPING[token][label] += 1
      } else {
        TOKEN_LABEL_MAPPING[token][label] = 1
      }
    })

    const tokenizedAttributes = tokenizeAttributes(tokens, attributes)

    const normalized = normalize(tokenizedAttributes, VOCABULARY)
    const schema = createSchema(normalized)

    if (!schema) {
      throw new Error("Product without schema")
    }

    const { categoria, ...newSchema } = schema
    SCHEMAS[categoria] = mergeSchemas(newSchema, SCHEMAS[categoria])
    MAPPINGS = Object.fromEntries(
      Object.entries(SCHEMAS).map(([categoria, schema]) => [
        categoria,
        schemaToMapping(schema),
      ]),
    )
  } catch (err) {
    skippedProducts += 1
  }
}

console.log(
  JSON.stringify({
    MAPPINGS,
    VOCABULARY,
    TOKEN_LABEL_MAPPING,
    SCHEMAS,
    skippedProducts,
  }),
)

await db.close()
await python.close()
