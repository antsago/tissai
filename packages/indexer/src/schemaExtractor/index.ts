import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import { type Token, matchTokens } from "./matchLabels.js"
import { type Schema, mergeSchemas, createSchema } from "./mergeSchemas.js"
import normalize, { type Vocabulary } from "./normalize.js"
import _ from "lodash"

const SCHEMAS = {} as Record<string, Schema>
const VOCABULARY = {} as Record<string, Vocabulary>

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

function* extractAttributes(tokens: ReturnType<typeof matchTokens>) {
  const words = tokens
    .map((t, i) => ({ ...t, fullIndex: i }))
    .filter((t) => t.isMeaningful)
  const getFragment = (start: number, end: number) => {
    const initialW = words.at(start)
    const finalW = words.at(end)

    const valueTokens = tokens.slice(initialW!.fullIndex, finalW!.fullIndex + 1)

    return {
      label: finalW!.label!,
      tokens: valueTokens,
      value: valueTokens
        .map((t, ind) =>
          ind === valueTokens.length - 1 ? t.text : `${t.text}${t.trailing}`,
        )
        .join(""),
    }
  }

  let yieldFrom = 0
  for (const [index, word] of words.entries()) {
    if (index === 0 || words[index - 1].label === word.label) {
      continue
    }

    yield getFragment(yieldFrom, index - 1)
    yieldFrom = index
  }

  yield getFragment(yieldFrom, words.length - 1)
}

let skippedProducts = 0
for await (let { title, attributes } of products) {
  try {
    const tokens = await python.send(title)
    const matched = matchTokens(tokens, attributes)
    const tokenizedAttributes = [...extractAttributes(matched)]

    const normalized = normalize(tokenizedAttributes, VOCABULARY)
    const schema = createSchema(normalized)

    if (!schema) {
      throw new Error("Product withouth schema")
    }

    const { categoria, ...newSchema } = schema
    const oldSchema = SCHEMAS[categoria]

    SCHEMAS[categoria] = !oldSchema
      ? newSchema
      : mergeSchemas(newSchema, oldSchema)
  } catch (err) {
    skippedProducts += 1
  }
}

console.log(JSON.stringify({ VOCABULARY, SCHEMAS, skippedProducts }))

await db.close()
await python.close()
