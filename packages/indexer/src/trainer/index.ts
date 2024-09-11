import { Compiler, type Model, NonMatch } from "../parser/index.js"
import { PageServer } from "../PageServer/index.js"
import { getSchemas } from "./schemas.js"
import { updateModel } from "./updateModel.js"
import { LlmLabeler } from "./LlmLabeler/index.js"

const MODEL: Model = {
  vocabulary: {},
  schemas: {},
}

await new PageServer<Compiler>()
  .extend((reporter) => {
    const python = LlmLabeler(reporter)
    const compiler = Compiler(getSchemas(python))
    return [
      compiler,
      () => Promise.all([compiler?.close(), python?.close()]),
    ]
  })
  .onPage(async (page, { compiler }) => {
    const entities = await compiler.parse(page.body)

    if (entities !== NonMatch) {
      updateModel(entities, MODEL)
    }
  })
  .start()

console.log(JSON.stringify(MODEL))
