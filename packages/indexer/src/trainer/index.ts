import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"
import Lexer from "../lexer/index.js"

const TOKEN_LABEL_MAPPING = {} as Record<string, Record<string, number>>

reporter.progress("Initializing database and pools")

const db = Db()
const lexer = Lexer()
const currentDirectory = dirname(fileURLToPath(import.meta.url))
const python = PythonPool<
  { title: string; words: string[] },
  { label: string; value: string }[]
>(`${currentDirectory}/labelWords.py`, reporter)

const [{ count: productCount }] = await db.query(
  query
    .selectFrom("products")
    .select(({ fn }) => fn.count("id").as("count"))
    .compile(),
)
const products = await db.stream(
  query.selectFrom("products").select(["title", "id"]).compile(),
)

let index = 1
for await (let { id, title } of products) {
  try {
    reporter.progress(
      `Processing product ${index}/${productCount}: ${id} (${title})`,
    )
    const tokens = await lexer.tokenize(title)

    const words = tokens
      .filter((t) => t.isMeaningful)
      .map((t) => t.originalText)
    const labels = await python.send({ title, words })

    let labelsIndex = 0
    const labeled = tokens.map((t) => {
      if (!t.isMeaningful) {
        return {
          ...t,
          label: undefined,
        }
      }

      const label = labels[labelsIndex]
      if (label.value !== t.originalText) {
        throw new Error(
          `With title "${title}", expected to match ${label.value} with ${t.originalText}`,
        )
      }
      labelsIndex += 1

      return {
        ...t,
        label: label.label,
      }
    })

    labeled
      .filter((t) => !!t.label)
      .forEach(({ label, text }) => {
        TOKEN_LABEL_MAPPING[text] = {
          ...(TOKEN_LABEL_MAPPING[text] ?? {}),
          [label!]: (TOKEN_LABEL_MAPPING[text]?.[label!] ?? 0) + 1,
        }
      })

    index += 1
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    reporter.error(`[${id} (${title})]: ${message}`)
  }
}

reporter.succeed(`Processed ${productCount} products`)
console.log(JSON.stringify(TOKEN_LABEL_MAPPING))

await db.close()
await lexer.close()
await python.close()
