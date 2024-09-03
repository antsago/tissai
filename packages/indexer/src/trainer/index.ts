import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"
import { Compiler, Id, type Model, NonMatch, Type } from "../parser/index.js"
import { type Label, ProductType, getSchemas } from "./schemas.js"
import { updateModel } from "./updateModel.js"
import { PageServer } from "../PageServer.js"
import { BrandType } from "../labeler/schemas.js"
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

const MODEL: Model = {
  vocabulary: {},
  schemas: {},
}

type ServerState = {
  compiler: Compiler
  python: PythonPool<{ title: string; words: string[] }, Label[]>
}

await new PageServer<ServerState>()
  .onInitialize(() => {
    const python = PythonPool<{ title: string; words: string[] }, Label[]>(
      `./labelWords.py`,
      reporter,
    )
    const compiler = Compiler(getSchemas(python))
    return {
      python,
      compiler,
    }
  })
  .onPage(async (page, { compiler, db }) => {
    const entities = await compiler.parse(page.body)

    if (entities !== NonMatch) {
      await Promise.all(entities.filter(e => e[Type] === BrandType)
        .map(b => saveBrand(b, db)))
      updateModel(entities, MODEL)
    }
  })
  .onClose(({ compiler, python }) =>
    Promise.all([compiler?.close(), python?.close()]),
  )
  .start()

console.log(JSON.stringify(MODEL))
