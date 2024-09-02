import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"
import { Compiler, type Model, NonMatch } from "../parser/index.js"
import { type Label, getSchemas } from "./schemas.js"
import { updateModel } from "./updateModel.js"
import { PageServer } from "../PageServer.js"

const MODEL: Model = {
  vocabulary: {},
  schemas: {},
}

await PageServer(
  () => {
    const python = PythonPool<{ title: string; words: string[] }, Label[]>(
      `./labelWords.py`,
      reporter,
    )
    const compiler = Compiler(getSchemas(python))
    return {
      python, compiler
    }
  },
  async (page, { compiler }) => {
    const entities = await compiler.parse(page.body)
    
    if (entities !== NonMatch) {
      updateModel(entities, MODEL)
    }
  },
  ({ compiler, python }) => Promise.all([
    compiler?.close(),
    python?.close(),
  ])
)

console.log(JSON.stringify(MODEL))
