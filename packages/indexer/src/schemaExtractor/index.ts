import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import matchLabels, { type Token, tokenizeAttributes } from "./matchLabels.js"
import { type Schema, mergeSchemas, createSchema } from "./mergeSchemas.js"
import normalize, { type Vocabulary } from "./normalize.js"

const SCHEMAS = {} as Record<string, Schema>
const VOCABULARY = {} as Record<string, Vocabulary>

type Mapping = Record<string, number>
const TOKEN_LABEL_MAPPING = {} as Record<string, Mapping>

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
  } catch (err) {
    skippedProducts += 1
  }
}

console.log(
  JSON.stringify({ VOCABULARY, TOKEN_LABEL_MAPPING, SCHEMAS, skippedProducts }),
)

await db.close()
await python.close()
