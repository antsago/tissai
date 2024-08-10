import { Db, query } from "@tissai/db"
import Lexer from "../parser/lexer/index.js"

const TOKEN_LABEL_MAPPING = {} as Record<string, Record<string, number>>

const db = Db()
const lexer = Lexer()

const products = await db.stream(
  query
    .selectFrom("products")
    .select("products.title")
    .compile(),
)

for await (let { title } of products) {
  const tokens = await lexer.tokenize(title)

  const labeled = tokens.map(t => ({...t, label: t.isMeaningful ? "label" : undefined }))
  labeled.filter(t => !!t.label).forEach(({ label, text }) => {
    TOKEN_LABEL_MAPPING[text] = {
      ...(TOKEN_LABEL_MAPPING[text] ?? {}),
      [label!]: (TOKEN_LABEL_MAPPING[text]?.[label!] ?? 0) + 1,
    }
  })
}

console.log(JSON.stringify(TOKEN_LABEL_MAPPING))

await db.close()
await lexer.close()
