import { Db, query } from "@tissai/db"
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

for await (let { attributes } of products) {
  const normalized = attributes.map((a) => ({
    id: a.id,
    product: a.product,
    label: normalizeString(a.label),
    value: normalizeValue(a.value),
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

console.log(JSON.stringify({ SCHEMAS, LABEL_VOCABULARY: VALUE_VOCABULARY }))

await db.close()
