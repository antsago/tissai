import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import matchLabels from "./matchLabels.js"
import { type Schema, mergeSchemas, createSchema } from "./mergeSchemas.js"

const SCHEMAS = {} as Record<string, Schema>

type Vocabulary = {
  canonical: string
  synonyms: Record<string, number>
}
const VALUE_VOCABULARY = {} as Record<string, Vocabulary>

const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
const normalizeValue = (value: string) => {
  const baseForm = normalizeString(value)

  if (baseForm in VALUE_VOCABULARY) {
    const vocab = VALUE_VOCABULARY[baseForm]
    vocab.synonyms[value] =
      value in vocab.synonyms ? vocab.synonyms[value] + 1 : 1

    if (vocab.synonyms[value] > vocab.synonyms[vocab.canonical]) {
      vocab.canonical = value
    }
  } else {
    VALUE_VOCABULARY[baseForm] = {
      canonical: value,
      synonyms: { [value]: 1 },
    }
  }

  return baseForm
}


type Mapping = Record<string, number>
const TOKEN_LABEL_MAPPING = {} as Record<string, Mapping>

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const python: PythonPool<string, string[]> = PythonPool(
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
  // const normalized = attributes.map((a) => ({
  //   id: a.id,
  //   product: a.product,
  //   label: normalizeString(a.label),
  //   value: normalizeValue(a.value),
  // }))
  // const schema = createSchema(normalized)

  // if (!schema) {
  //   continue
  // }

  // const { categoria, ...newSchema } = schema
  // const oldSchema = SCHEMAS[categoria]

  // SCHEMAS[categoria] = !oldSchema
  //   ? newSchema
  //   : mergeSchemas(newSchema, oldSchema)
  try {
    const tokens = await python.send(title)
    const mappings = matchLabels(tokens, attributes)
    mappings.forEach(({ token, label }) => {
      if (!(token in TOKEN_LABEL_MAPPING)) {
        TOKEN_LABEL_MAPPING[token] = { [label]: 1 }
      } else if (label in TOKEN_LABEL_MAPPING[token]) {
        TOKEN_LABEL_MAPPING[token][label] += 1
      } else {
        TOKEN_LABEL_MAPPING[token][label] = 1
      }
    })
  } catch (err) {
    skippedProducts += 1
  }
}

console.log(JSON.stringify({ TOKEN_LABEL_MAPPING, skippedProducts }))

await db.close()
