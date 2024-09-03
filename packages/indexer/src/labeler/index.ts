import { BrandType, getSchemas, SellerType } from "./schemas.js"
import { Compiler, NonMatch, Type } from "../parser/index.js"
import { PageServer } from "../PageServer.js"
import { brand } from "./brand.js"
import seller from "./seller.js"

let result = [] as any[]

await new PageServer<{ compiler: Compiler }>()
  .onInitialize(() => ({ compiler: Compiler(getSchemas) }))
  .onClose(async ({ compiler }) => compiler?.close())
  .onPage(async (page, { compiler, db }) => {
    const entities = await compiler.parse(page.body)

    if (entities !== NonMatch) {
      await Promise.all(
        entities
          .map(async (e) => {
            switch(e[Type]) {
              case BrandType:
                return brand(e, db)
              case SellerType:
                return seller(e, db)
              default:
                return
            }
          })
      )

      result = result.concat(entities)
    }
  })
  .start()

console.dir(result, { depth: null })
