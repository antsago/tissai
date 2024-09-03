import { getSchemas } from "./schemas.js"
import { Compiler, NonMatch } from "../parser/index.js"
import { PageServer } from "../PageServer.js"

let result = [] as any[]

await new PageServer<{ compiler: Compiler }>()
  .onInitialize(() => ({ compiler: Compiler(getSchemas) }))
  .onClose(async ({ compiler }) => compiler?.close())
  .onPage(async (page, { compiler }) => {
    const entities = await compiler.parse(page.body)

    if (entities !== NonMatch) {
      result = result.concat(entities)
    }
  })
  .start()

console.dir(result, { depth: null })
