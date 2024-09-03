import { BrandType, getSchemas } from "./schemas.js"
import { Compiler, NonMatch, Type } from "../parser/index.js"
import { PageServer } from "../PageServer.js"
import { Brand, Db } from "@tissai/db"

const saveBrand = async (brand: Brand, db: Db) => {
  const existing = await db.brands.byName(brand.name)

  if (!existing) {
    await db.brands.create(brand)
    return
  }

  if (existing.logo || !brand.logo) {
    return
  }

  const updated = {
    ...existing,
    logo: brand.logo,
  }

  await db.brands.update(updated)
}

let result = [] as any[]

await new PageServer<{ compiler: Compiler }>()
  .onInitialize(() => ({ compiler: Compiler(getSchemas) }))
  .onClose(async ({ compiler }) => compiler?.close())
  .onPage(async (page, { compiler, db }) => {
    const entities = await compiler.parse(page.body)

    if (entities !== NonMatch) {
      await Promise.all(
        entities
          .filter((e) => e[Type] === BrandType)
          .map((b) => saveBrand(b, db)),
      )

      result = result.concat(entities)
    }
  })
  .start()

console.dir(result, { depth: null })
