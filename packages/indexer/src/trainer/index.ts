import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"
import Lexer from "../lexer/index.js"
import { type Label, labelTokens } from './labelTokens.js'

reporter.progress("Initializing database and pools")

const db = Db()
const lexer = Lexer()
const python = PythonPool<
  { title: string; words: string[] },
  Label[]
>(`./labelWords.py`, reporter)

const [{ count: productCount }] = await db.query(
  query
    .selectFrom("products")
    .select(({ fn }) => fn.count("id").as("count"))
    .compile(),
)
const products = await db.stream(
  query.selectFrom("products").select(["title", "id"]).limit(2).compile(),
)

const TOKEN_LABEL_MAPPING = {} as Record<string, Record<string, number>>
let index = 1
for await (let { id, title } of products) {
  try {
    reporter.progress(
      `Processing product ${index}/${productCount}: ${id} (${title})`,
    )
    const tokens = await lexer.tokenize(title)
    const labeled = await labelTokens(tokens, title, python)

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
