import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"
import { Compiler, type Token, type LabelMap } from "../parser/index.js"
import { type Label, getSchemas } from "./schemas.js"

const updateMapping = (
  vocabulary: LabelMap,
  labeled: (Token & { label?: string })[],
) =>
  labeled
    .filter((t) => t.isMeaningful && t.label !== undefined)
    .forEach(({ label, text }) => {
      vocabulary[text] = {
        ...(vocabulary[text] ?? {}),
        [label!]: (vocabulary[text]?.[label!] ?? 0) + 1,
      }
    })
const CATEGORY_LABEL = "categoría"
const updateSchemas = (
  schemas: LabelMap,
  labeled: (Token & { label?: string })[],
) => {
  const categories = labeled
    .filter((word) => word.label === CATEGORY_LABEL)
    .map((word) => word.text)
  const otherLabels = labeled
    .map((att) => att.label)
    .filter((label) => !!label && label !== CATEGORY_LABEL)

  categories.forEach((cat) =>
    otherLabels.forEach((label) => {
      schemas[cat] = {
        ...(schemas[cat] ?? {}),
        // Add an extra count so unknown categories can have a phantom count
        [label!]: (schemas[cat]?.[label!] ?? 1) + 1,
      }
    }),
  )
}

reporter.progress("Initializing database and pools")

const db = Db()
const python = PythonPool<{ title: string; words: string[] }, Label[]>(
  `./labelWords.py`,
  console,
)

const compiler = Compiler(getSchemas(python))

const [{ count: pageCount }] = await db.query(
  query
    .selectFrom("pages")
    .select(({ fn }) => fn.count("id").as("count"))
    .compile(),
)
const pages = await db.stream(
  query.selectFrom("pages").select(["body", "url", "id"]).limit(1).compile(),
)

const VOCABULARY = {} as LabelMap
const SCHEMAS = {} as LabelMap
let index = 1
for await (let { id, body, url } of pages) {
  try {
    reporter.progress(`Processing page ${index}/${pageCount}: ${id} (${url})`)

    const entities = await compiler.parse(body)

    if (typeof entities !== "symbol") {
      const products = entities
        .filter(
          (entity) => typeof entity !== "symbol" && "parsedTitle" in entity,
        )
        .map((product) => product.parsedTitle)

      updateMapping(VOCABULARY, products.flat())
      products.forEach((product) => updateSchemas(SCHEMAS, product))
    }

    index += 1
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    reporter.error(`[${id} (${url})]: ${message}`)
  }
}

reporter.succeed(`Processed ${pageCount} pages`)
console.log(JSON.stringify(VOCABULARY))
console.log(JSON.stringify(SCHEMAS))

await db.close()
await compiler.close()
await python.close()
