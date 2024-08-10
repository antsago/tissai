import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import Lexer from "../lexer/index.js"

const TOKEN_LABEL_MAPPING = {} as Record<string, Record<string, number>>

const db = Db()
const lexer = Lexer()
const currentDirectory = dirname(fileURLToPath(import.meta.url))
const python = PythonPool<
  { title: string; words: string[] },
  { label: string; value: string }[]
>(`${currentDirectory}/labelWords.py`, console)

const products = await db.stream(
  query.selectFrom("products").select("products.title").compile(),
)

for await (let { title } of products) {
  const tokens = await lexer.tokenize(title)

  const words = tokens.filter((t) => t.isMeaningful).map((t) => t.originalText)
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
}

console.log(JSON.stringify(TOKEN_LABEL_MAPPING))

await db.close()
await lexer.close()
await python.close()
