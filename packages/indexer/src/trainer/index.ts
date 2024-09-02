import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"
import { Compiler, type Model, NonMatch } from "../parser/index.js"
import { type Label, getSchemas } from "./schemas.js"
import { updateModel } from "./updateModel.js"
import { runForAllPages } from "./runForAllPages.js"

reporter.progress("Initializing database and pools")

const MODEL: Model = {
  vocabulary: {},
  schemas: {},
}
const db = Db()
const python = PythonPool<{ title: string; words: string[] }, Label[]>(
  `./labelWords.py`,
  reporter,
)
const compiler = Compiler(getSchemas(python))

runForAllPages(db, async (page) => {
  const entities = await compiler.parse(page.body)

  if (entities !== NonMatch) {
    updateModel(entities, MODEL)
  }
})

console.log(JSON.stringify(MODEL))

await db.close()
await compiler.close()
await python.close()
