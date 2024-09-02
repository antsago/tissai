import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"
import { Compiler, type Model, NonMatch } from "../parser/index.js"
import { type Label, getSchemas } from "./schemas.js"
import { updateModel } from "./updateModel.js"

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

const MODEL: Model = {
  vocabulary: {},
  schemas: {},
}
let index = 1
for await (let { id, body, url } of pages) {
  try {
    reporter.progress(`Processing page ${index}/${pageCount}: ${id} (${url})`)

    const entities = await compiler.parse(body)

    if (entities !== NonMatch) {
      updateModel(entities, MODEL)
    }

    index += 1
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    reporter.error(`[${id} (${url})]: ${message}`)
  }
}

reporter.succeed(`Processed ${pageCount} pages`)
console.log(JSON.stringify(MODEL))

await db.close()
await compiler.close()
await python.close()
