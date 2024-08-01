import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import matchLabels from "./matchLabels.js"

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
