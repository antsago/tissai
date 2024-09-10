import { Compiler, type Model, NonMatch } from "../parser/index.js"
import { getSchemas } from "./schemas.js"
import { updateModel } from "./updateModel.js"
import { PageServer } from "../PageServer.js"
import { LlmLabeler } from "./LlmLabeler.js"

const MODEL: Model = {
  vocabulary: {},
  schemas: {},
}

type ServerState = {
  compiler: Compiler
  python: LlmLabeler
}

await new PageServer<ServerState>()
  .onInitialize(() => {
    const python = LlmLabeler()
    const compiler = Compiler(getSchemas(python))
    return {
      python,
      compiler,
    }
  })
  .onPage(async (page, { compiler, db }) => {
    const entities = await compiler.parse(page.body)

    if (entities !== NonMatch) {
      updateModel(entities, MODEL)
    }
  })
  .onClose(({ compiler, python }) =>
    Promise.all([compiler?.close(), python?.close()]),
  )
  .start()

console.log(JSON.stringify(MODEL))
