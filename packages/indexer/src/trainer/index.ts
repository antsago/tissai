import { type Compiler, type Model, NonMatch } from "../parser/index.js"
import { PageServer } from "../PageServer/index.js"
import { updateModel } from "./updateModel.js"
import { compilerFixture } from "./compilerFixture.js"

const MODEL: Model = {
  vocabulary: {},
  schemas: {},
}

await new PageServer<Compiler>()
  .with(compilerFixture)
  .onPage(async (page, { compiler }) => {
    const entities = await compiler.parse(page.body)

    if (entities !== NonMatch) {
      updateModel(entities, MODEL)
    }
  })
  .start()

console.log(JSON.stringify(MODEL))
