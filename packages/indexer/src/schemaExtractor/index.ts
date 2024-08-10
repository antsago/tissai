import { Db, query } from "@tissai/db"
import { normalizeString } from "../parser/lexer/index.js"
import { tokenizeAttributes } from "./matchLabels.js"
import { type Schema, mergeSchemas, createSchema } from "./mergeSchemas.js"
import normalize, { type Vocabulary } from "./normalize.js"
import { Scanner } from "../parser/lexer/index.js"

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

const scanner = Scanner()

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

function mapTokens(attributes: ReturnType<typeof tokenizeAttributes>) {
  attributes.forEach(({ tokens }) => {
    tokens
      .filter(({ label }) => !!label)
      .forEach(({ label: rawLabel, text: rawText }) => {
        const label = normalizeString(rawLabel!)
        const text = normalizeString(rawText)

        TOKEN_LABEL_MAPPING[text] = {
          ...(TOKEN_LABEL_MAPPING[text] ?? {}),
          [label]: (TOKEN_LABEL_MAPPING[text]?.[label] ?? 0) + 1,
        }
      })
  })
}

let skippedProducts = 0
for await (let { title, attributes } of products) {
  try {
    const tokens = await scanner.tokenize(title)

    const tokenizedAttributes = tokenizeAttributes(tokens, attributes)
    mapTokens(tokenizedAttributes)
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
await scanner.close()
