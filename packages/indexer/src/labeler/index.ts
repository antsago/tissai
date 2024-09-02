import { getSchemas } from "./schemas.js"
import { Compiler, NonMatch } from "../parser/index.js"
import { PageServer } from "../PageServer.js"

let entities = [] as any[]

await new PageServer<{ compiler: Compiler }>()
  .onInitialize(() => ({ compiler: Compiler(getSchemas) }))
  .onClose(async ({ compiler }) => compiler?.close())
  .onPage(async (page, { compiler }) => {
    const result = await compiler.parse(page.body)
    if (result !== NonMatch) {
      entities = entities.concat(result)
    }
  })
  .start()

console.dir(entities, { depth: null })
